import { Poll, PollOption } from '../app/types';

interface PollUserState {
    pollId: string;
    userId: string;
    votedOptionIds: string[];
    lastVoteAction?: {
        optionId: string;
        action: 'vote' | 'unvote';
        timestamp: number;
    };
}

interface PollGlobalState {
    [pollId: string]: {
        poll: Poll;
        userStates: { [userId: string]: PollUserState };
        lastUpdate: number;
    };
}

export class PollStateManager {
    private static instance: PollStateManager;
    private globalState: PollGlobalState = {};
    private subscribers: Map<string, ((poll: Poll) => void)[]> = new Map();

    static getInstance(): PollStateManager {
        if (!PollStateManager.instance) {
            PollStateManager.instance = new PollStateManager();
        }
        return PollStateManager.instance;
    }

    /**
     * Subscribe to poll updates
     */
    subscribe(pollId: string, callback: (poll: Poll) => void): () => void {
        if (!this.subscribers.has(pollId)) {
            this.subscribers.set(pollId, []);
        }

        this.subscribers.get(pollId)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(pollId);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * Initialize poll state
     */
    initializePoll(poll: Poll, userId: string) {
        if (!this.globalState[poll.id]) {
            this.globalState[poll.id] = {
                poll: { ...poll },
                userStates: {},
                lastUpdate: Date.now()
            };
        }

        // Initialize user state if not exists
        if (!this.globalState[poll.id].userStates[userId]) {
            const votedOptions = poll.options
                .filter(opt => opt.votes.some(vote => vote.userId === userId))
                .map(opt => opt.id);

            this.globalState[poll.id].userStates[userId] = {
                pollId: poll.id,
                userId,
                votedOptionIds: votedOptions
            };
        }

        console.log(`🔄 [PollStateManager] Initialized poll ${poll.id} for user ${userId}`);
    }

    /**
     * Handle local vote (immediate update)
     */
    handleLocalVote(pollId: string, optionId: string, userId: string, action: 'vote' | 'unvote'): Poll | null {
        const pollState = this.globalState[pollId];
        if (!pollState) {
            console.error(`❌ [PollStateManager] Poll ${pollId} not found`);
            return null;
        }

        const userState = pollState.userStates[userId];
        if (!userState) {
            console.error(`❌ [PollStateManager] User state for ${userId} not found in poll ${pollId}`);
            return null;
        }

        // Create updated poll
        const updatedPoll = { ...pollState.poll };
        updatedPoll.options = updatedPoll.options.map(option => {
            if (option.id === optionId) {
                const newOption = { ...option };

                if (action === 'vote') {
                    // Add vote
                    const existingVote = newOption.votes.find(vote => vote.userId === userId);
                    if (!existingVote) {
                        // Get user info from existing votes or use defaults
                        const existingUserVote = pollState.poll.options
                            .flatMap(opt => opt.votes)
                            .find(vote => vote.userId === userId);

                        newOption.votes = [...newOption.votes, {
                            userId,
                            userName: existingUserVote?.userName || `User ${userId}`,
                            userAvatar: existingUserVote?.userAvatar || '',
                            votedAt: new Date()
                        }];
                    }
                } else {
                    // Remove vote
                    newOption.votes = newOption.votes.filter(vote => vote.userId !== userId);
                }

                return newOption;
            }
            return option;
        });

        // Update total voters
        const allVoters = new Set<string>();
        updatedPoll.options.forEach(opt => {
            opt.votes.forEach(vote => allVoters.add(vote.userId));
        });
        updatedPoll.totalVoters = allVoters.size;

        // Update user state
        if (action === 'vote') {
            if (!userState.votedOptionIds.includes(optionId)) {
                userState.votedOptionIds.push(optionId);
            }
        } else {
            userState.votedOptionIds = userState.votedOptionIds.filter(id => id !== optionId);
        }

        userState.lastVoteAction = {
            optionId,
            action,
            timestamp: Date.now()
        };

        // Update global state
        pollState.poll = updatedPoll;
        pollState.lastUpdate = Date.now();

        console.log(`🗳️ [PollStateManager] Local ${action} for user ${userId} on option ${optionId}`);

        return updatedPoll;
    }

    /**
     * Handle remote update (from other users)
     */
    handleRemoteUpdate(updatedPoll: Poll, excludeUserId?: string): void {
        const pollState = this.globalState[updatedPoll.id];
        if (!pollState) {
            console.warn(`⚠️ [PollStateManager] Received remote update for unknown poll ${updatedPoll.id}`);
            return;
        }

        // Don't overwrite recent local changes
        const timeSinceLastUpdate = Date.now() - pollState.lastUpdate;
        if (timeSinceLastUpdate < 1000) { // 1 second buffer
            console.log(`⏰ [PollStateManager] Ignoring remote update - recent local change (${timeSinceLastUpdate}ms ago)`);
            return;
        }

        // Update global poll state
        pollState.poll = { ...updatedPoll };
        pollState.lastUpdate = Date.now();

        console.log(`📡 [PollStateManager] Remote update applied for poll ${updatedPoll.id}`);

        // Notify subscribers (except the user who made the change)
        const callbacks = this.subscribers.get(updatedPoll.id);
        if (callbacks) {
            callbacks.forEach(callback => {
                // You could add logic here to filter based on excludeUserId if needed
                callback(updatedPoll);
            });
        }
    }

    /**
     * Get current poll state
     */
    getPollState(pollId: string): Poll | null {
        const pollState = this.globalState[pollId];
        return pollState ? pollState.poll : null;
    }

    /**
     * Get user's voting state for a poll
     */
    getUserVotingState(pollId: string, userId: string): string[] {
        const pollState = this.globalState[pollId];
        if (!pollState || !pollState.userStates[userId]) {
            return [];
        }
        return pollState.userStates[userId].votedOptionIds;
    }

    /**
     * Check if user has voted in a poll
     */
    hasUserVoted(pollId: string, userId: string): boolean {
        const votedOptions = this.getUserVotingState(pollId, userId);
        return votedOptions.length > 0;
    }

    /**
     * Get options that user has NOT voted for
     */
    getOptionsUserCanSee(pollId: string, userId: string): string[] {
        const pollState = this.globalState[pollId];
        if (!pollState) return [];

        const userVotedOptions = this.getUserVotingState(pollId, userId);
        const hasUserVoted = userVotedOptions.length > 0;

        // Return options that:
        // 1. User has voted for (always visible)
        // 2. Others have voted for AND user hasn't voted yet
        // 3. Others have voted for AND user has voted elsewhere (minimal visibility)
        return pollState.poll.options
            .filter(option => {
                const isUserVoted = userVotedOptions.includes(option.id);
                const hasOtherVotes = option.votes.some(vote => vote.userId !== userId);

                return isUserVoted || hasOtherVotes;
            })
            .map(option => option.id);
    }

    /**
     * Clean up old poll states
     */
    cleanup(pollId?: string) {
        if (pollId) {
            delete this.globalState[pollId];
            this.subscribers.delete(pollId);
            console.log(`🧹 [PollStateManager] Cleaned up poll ${pollId}`);
        } else {
            // Clean up polls older than 1 hour
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;

            Object.keys(this.globalState).forEach(id => {
                if (now - this.globalState[id].lastUpdate > oneHour) {
                    delete this.globalState[id];
                    this.subscribers.delete(id);
                }
            });

            console.log(`🧹 [PollStateManager] Cleaned up old polls`);
        }
    }
}