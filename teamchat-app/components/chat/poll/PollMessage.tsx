'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PollOptionComponent from './PollOption';
import { PollStateManager } from '../../../services/pollStateManager';
import { Poll } from '../../../app/types';

interface PollMessageProps {
    poll: Poll;
    currentUserId: string;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
    isDarkMode: boolean;
}

export function PollMessage({
    poll,
    currentUserId,
    onVote,
    onViewResults,
    isDarkMode,
}: PollMessageProps) {
    const [localPoll, setLocalPoll] = useState<Poll>(poll);
    const pollStateManager = PollStateManager.getInstance();

    // Initialize poll state manager
    useEffect(() => {
        pollStateManager.initializePoll(poll, currentUserId);

        // Subscribe to remote updates
        const unsubscribe = pollStateManager.subscribe(poll.id, (updatedPoll) => {
            console.log(`📡 [PollMessage] Received remote update for poll ${poll.id}`);
            setLocalPoll(updatedPoll);
        });

        return unsubscribe;
    }, [poll.id, currentUserId, pollStateManager]);

    // Sync with prop changes (for initial load and external updates)
    useEffect(() => {
        setLocalPoll(poll);
    }, [poll]);

    const totalVotes = localPoll.options.reduce((sum, option) => sum + option.votes.length, 0);
    const userVotes = localPoll.options.filter((option) =>
        option.votes.some((vote) => vote.userId === currentUserId)
    );
    const hasVoted = userVotes.length > 0;

    const shouldShowResults =
        localPoll.showResults === "always" ||
        (localPoll.showResults === "after_vote" && hasVoted) ||
        (localPoll.showResults === "after_end" && !localPoll.isActive);

    const isExpired = localPoll.endTime && new Date(localPoll.endTime) < new Date();
    const timeRemaining = localPoll.endTime ? new Date(localPoll.endTime).getTime() - new Date().getTime() : null;

    const formatTimeRemaining = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    };

    // Handle local vote with immediate UI update
    const handleOptionVote = useCallback((optionId: string) => {
        console.log(`🗳️ [PollMessage] Local vote on option ${optionId}`);

        // Determine if this is a vote or unvote
        const isCurrentlyVoted = localPoll.options
            .find(opt => opt.id === optionId)
            ?.votes.some(vote => vote.userId === currentUserId);

        const action = isCurrentlyVoted ? 'unvote' : 'vote';

        // Update local state immediately
        const updatedPoll = pollStateManager.handleLocalVote(localPoll.id, optionId, currentUserId, action);

        if (updatedPoll) {
            // Update local UI immediately
            setLocalPoll(updatedPoll);

            // Then call the parent's onVote for server sync
            onVote(localPoll.id, optionId);
        }
    }, [localPoll, currentUserId, onVote, pollStateManager]);

    return (
        <div className={`rounded-xl w-[380px] overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${isDarkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200/80"
            }`}>
            {/* Header */}
            <div className={`p-5 border-b ${isDarkMode
                ? "border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
                : "border-gray-200/80 bg-gradient-to-r from-blue-50 to-indigo-50"
                }`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Cuộc bình chọn
                    </span>
                    <div className="flex gap-2 ml-auto">
                        {isExpired && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-md">
                                Đã kết thúc
                            </span>
                        )}
                        {localPoll.isActive && !isExpired && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-md animate-pulse">
                                Đang diễn ra
                            </span>
                        )}
                    </div>
                </div>

                <h3 className={`font-bold text-xl mb-2 leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {localPoll.question}
                </h3>

                {localPoll.description && (
                    <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {localPoll.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {localPoll.totalVoters} người tham gia
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {localPoll.endTime && timeRemaining && timeRemaining > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {formatTimeRemaining(timeRemaining)}
                                </span>
                            </div>
                        )}

                        {localPoll.isAnonymous && (
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${isDarkMode
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-purple-50 text-purple-600 border border-purple-200"
                                }`}>
                                Ẩn danh
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="p-5 space-y-3">
                {localPoll.options.map((option, index) => (
                    <PollOptionComponent
                        key={option.id}
                        option={option}
                        index={index}
                        currentUserId={currentUserId}
                        totalVotes={totalVotes}
                        canVote={localPoll.isActive && !isExpired}
                        isDarkMode={isDarkMode}
                        onVote={handleOptionVote}
                        forceShowProgress={shouldShowResults}
                        userHasVotedElsewhere={hasVoted}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t ${isDarkMode
                ? "border-gray-700/50 bg-gray-800/30"
                : "border-gray-200/50 bg-gray-50/50"
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <span className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {totalVotes} lượt vote
                        </span>
                        {poll.allowMultiple && (
                            <>
                                <span className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>•</span>
                                <span className={`text-xs ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                    Chọn nhiều
                                </span>
                            </>
                        )}
                        {hasVoted && (
                            <>
                                <span className={`${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>•</span>
                                <span className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                    Đã bình chọn
                                </span>
                            </>
                        )}
                    </div>
                    {shouldShowResults && (
                        <Button
                            onClick={() => onViewResults(localPoll)}
                            variant="ghost"
                            size="sm"
                            className={`text-xs font-medium transition-all duration-200 ${isDarkMode
                                ? "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                }`}
                        >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Chi tiết
                        </Button>
                    )}
                </div>
                <div className={`text-xs mt-1.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {localPoll.createdByName} • {new Date(localPoll.createdAt).toLocaleDateString("vi-VN", {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
}