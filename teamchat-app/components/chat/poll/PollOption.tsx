import React, { memo, useMemo } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { PollOption as PollOptionType } from '../../../app/types';

interface PollOptionProps {
    option: PollOptionType;
    index: number;
    currentUserId: string;
    totalVotes: number;
    canVote: boolean;
    isDarkMode: boolean;
    onVote: (optionId: string) => void;
    // These props control when to show progress/styling
    forceShowProgress?: boolean;
    userHasVotedElsewhere?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const PollOptionComponent = memo(function PollOptionComponent({
    option,
    index,
    currentUserId,
    totalVotes,
    canVote,
    isDarkMode,
    onVote,
    forceShowProgress = false,
    userHasVotedElsewhere = false
}: PollOptionProps) {

    // Calculate this option's state
    const optionState = useMemo(() => {
        const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
        const isUserSelected = option.votes.some(vote => vote.userId === currentUserId);
        const hasVotes = option.votes.length > 0;

        // Logic for showing progress:
        let shouldShowProgress = false;
        let visualIntensity: 'high' | 'medium' | 'low' = 'low';

        if (isUserSelected) {
            // User voted for this option - always show with high intensity
            shouldShowProgress = true;
            visualIntensity = 'high';
        } else if (hasVotes && !userHasVotedElsewhere) {
            // Others voted for this option and user hasn't voted yet - medium intensity
            shouldShowProgress = true;
            visualIntensity = 'medium';
        } else if (hasVotes && userHasVotedElsewhere) {
            // Others voted for this option but user has voted elsewhere - low intensity
            shouldShowProgress = true;
            visualIntensity = 'low';
        } else if (forceShowProgress) {
            // Force show (for global settings)
            shouldShowProgress = true;
            visualIntensity = 'medium';
        }

        return {
            percentage,
            isUserSelected,
            hasVotes,
            shouldShowProgress,
            visualIntensity,
            voteCount: option.votes.length
        };
    }, [option.votes, currentUserId, totalVotes, userHasVotedElsewhere, forceShowProgress]);

    // Get styling based on visual state
    const getOptionStyling = () => {
        if (!canVote) {
            return "cursor-not-allowed opacity-60";
        }

        if (optionState.isUserSelected) {
            // User selected - high intensity blue styling
            return isDarkMode
                ? "border-blue-400 bg-gradient-to-r from-blue-900/30 to-blue-800/30 shadow-lg shadow-blue-500/20"
                : "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20";
        }

        if (optionState.shouldShowProgress && optionState.visualIntensity === 'medium') {
            // Others voted, user hasn't - medium intensity
            return isDarkMode
                ? "border-gray-500 bg-gradient-to-r from-gray-800/40 to-gray-700/40 hover:border-gray-400"
                : "border-gray-300 bg-gradient-to-r from-gray-100/50 to-gray-200/50 hover:border-gray-400";
        }

        if (optionState.shouldShowProgress && optionState.visualIntensity === 'low') {
            // Others voted, user voted elsewhere - low intensity
            return isDarkMode
                ? "border-gray-600 bg-gradient-to-r from-gray-800/20 to-gray-700/20"
                : "border-gray-200 bg-gradient-to-r from-gray-100/20 to-gray-200/20";
        }

        // Default styling
        return isDarkMode
            ? "border-gray-600 hover:border-gray-500 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30"
            : "border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100";
    };

    // Get icon based on state
    const getOptionIcon = () => {
        if (optionState.isUserSelected) {
            return (
                <div className="relative">
                    <CheckCircle className="h-6 w-6 text-blue-500 drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping scale-75 opacity-25"></div>
                </div>
            );
        }

        if (optionState.hasVotes && optionState.shouldShowProgress) {
            const iconColor = optionState.visualIntensity === 'medium'
                ? (canVote ? "text-blue-400" : "text-gray-300")
                : "text-gray-400";

            return (
                <div className="relative">
                    <Circle
                        className={`h-6 w-6 transition-colors duration-200 ${iconColor}`}
                        fill="currentColor"
                        fillOpacity="0.2"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${optionState.visualIntensity === 'medium' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                    </div>
                </div>
            );
        }

        return (
            <Circle className={`h-6 w-6 transition-colors duration-200 ${canVote ? "text-gray-400 group-hover:text-blue-400" : "text-gray-300"
                }`} />
        );
    };

    return (
        <button
            onClick={() => canVote && onVote(option.id)}
            disabled={!canVote}
            className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${getOptionStyling()}`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="relative z-10 p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {getOptionIcon()}
                        </div>
                        <span className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {option.text}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-white/70"
                        } backdrop-blur-sm`}>
                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {optionState.voteCount}
                        </span>
                        {optionState.shouldShowProgress && (
                            <span className="text-sm font-medium text-blue-500">
                                ({optionState.percentage.toFixed(0)}%)
                            </span>
                        )}
                    </div>
                </div>

                {optionState.shouldShowProgress && (
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${optionState.visualIntensity === 'high'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                    : optionState.visualIntensity === 'medium'
                                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                }`}
                            style={{ width: `${optionState.percentage}%` }}
                        />
                    </div>
                )}
            </div>
        </button>
    );
});

export default PollOptionComponent;