import { useState, useCallback, useMemo } from 'react';
import { Poll, PollOption } from '../app/types';

interface PollUIState {
    [optionId: string]: {
        isUserSelected: boolean;
        showProgress: boolean;
        visualState: 'default' | 'selected' | 'hasVotes' | 'stable';
        lastUserAction?: 'vote' | 'unvote';
    };
}

interface UsePollStateProps {
    poll: Poll;
    currentUserId: string;
}

export function usePollState({ poll, currentUserId }: UsePollStateProps) {
    const [uiState, setUIState] = useState<PollUIState>({});

    // Calculate derived state
    const derivedState = useMemo(() => {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        const userVotes = poll.options.filter(opt =>
            opt.votes.some(vote => vote.userId === currentUserId)
        );
        const hasUserVoted = userVotes.length > 0;

        return {
            totalVotes,
            userVotes,
            hasUserVoted
        };
    }, [poll.options, currentUserId]);

    // Get UI state for specific option
    const getOptionUIState = useCallback((option: PollOption) => {
        const percentage = derivedState.totalVotes > 0
            ? (option.votes.length / derivedState.totalVotes) * 100
            : 0;

        const isUserSelected = option.votes.some(vote => vote.userId === currentUserId);
        const hasVotes = option.votes.length > 0;
        const otherUsersVoted = hasVotes && !isUserSelected;

        // Determine if this option should show progress
        let shouldShowProgress = false;
        let visualState: 'default' | 'selected' | 'hasVotes' | 'stable' = 'default';

        if (isUserSelected) {
            // User voted for this option - always show progress
            shouldShowProgress = true;
            visualState = 'selected';
        } else if (otherUsersVoted && !derivedState.hasUserVoted) {
            // Others voted for this option and current user hasn't voted yet
            shouldShowProgress = true;
            visualState = 'hasVotes';
        } else if (otherUsersVoted && derivedState.hasUserVoted) {
            // Others voted for this option but user has voted elsewhere - show minimal progress
            shouldShowProgress = true;
            visualState = 'stable';
        }

        return {
            percentage,
            isUserSelected,
            hasVotes,
            shouldShowProgress,
            visualState,
            votes: option.votes,
            voteCount: option.votes.length
        };
    }, [derivedState, currentUserId]);

    // Handle local vote action (immediate UI update)
    const handleLocalVote = useCallback((optionId: string, action: 'vote' | 'unvote') => {
        setUIState(prev => ({
            ...prev,
            [optionId]: {
                ...prev[optionId],
                isUserSelected: action === 'vote',
                showProgress: true,
                visualState: action === 'vote' ? 'selected' : 'default',
                lastUserAction: action
            }
        }));
    }, []);

    // Handle remote update (only update what's necessary)
    const handleRemoteUpdate = useCallback((updatedPoll: Poll) => {
        // Don't update UI state for options where user has voted
        // Only update for options where others have voted
        const userVotedOptions = poll.options
            .filter(opt => opt.votes.some(vote => vote.userId === currentUserId))
            .map(opt => opt.id);

        setUIState(prev => {
            const newState = { ...prev };

            updatedPoll.options.forEach(option => {
                // Skip updating UI for options where current user has voted
                if (!userVotedOptions.includes(option.id)) {
                    const hasVotes = option.votes.length > 0;
                    const isUserSelected = option.votes.some(vote => vote.userId === currentUserId);

                    newState[option.id] = {
                        ...prev[option.id],
                        isUserSelected,
                        showProgress: hasVotes || isUserSelected,
                        visualState: isUserSelected ? 'selected' : hasVotes ? 'hasVotes' : 'default'
                    };
                }
            });

            return newState;
        });
    }, [poll.options, currentUserId]);

    return {
        derivedState,
        getOptionUIState,
        handleLocalVote,
        handleRemoteUpdate
    };
}