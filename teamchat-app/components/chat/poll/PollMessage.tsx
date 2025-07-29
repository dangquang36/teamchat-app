'use client';

import { useState } from 'react';
import { BarChart3, Users, Clock, CheckCircle, Circle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PollOption {
    id: string;
    text: string;
    votes: {
        userId: string;
        userName: string;
        userAvatar: string;
        votedAt: Date;
    }[];
}

export interface Poll {
    id: string;
    question: string;
    description?: string;
    options: PollOption[];
    allowMultiple: boolean;
    isAnonymous: boolean;
    showResults: "always" | "after_vote" | "after_end";
    createdBy: string;
    createdByName: string;
    createdAt: Date;
    endTime?: Date;
    isActive: boolean;
    totalVoters: number;
}

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
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
    const userVotes = poll.options.filter((option) =>
        option.votes.some((vote) => vote.userId === currentUserId)
    );
    const hasVoted = userVotes.length > 0;

    const shouldShowResults =
        poll.showResults === "always" ||
        (poll.showResults === "after_vote" && hasVoted) ||
        (poll.showResults === "after_end" && !poll.isActive);

    const isExpired = poll.endTime && poll.endTime < new Date();
    const timeRemaining = poll.endTime ? poll.endTime.getTime() - new Date().getTime() : null;

    const formatTimeRemaining = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ ${minutes} phút`;
        return `${minutes} phút`;
    };

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
                        {poll.isActive && !isExpired && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-md animate-pulse">
                                Đang diễn ra
                            </span>
                        )}
                    </div>
                </div>

                <h3 className={`font-bold text-xl mb-2 leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {poll.question}
                </h3>

                {poll.description && (
                    <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {poll.description}
                    </p>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {poll.totalVoters} người tham gia
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {poll.endTime && timeRemaining && timeRemaining > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                    {formatTimeRemaining(timeRemaining)}
                                </span>
                            </div>
                        )}

                        {poll.isAnonymous && (
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
                {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                    const isSelected = option.votes.some((vote) => vote.userId === currentUserId);
                    const canVote = poll.isActive && !isExpired;

                    return (
                        <button
                            key={option.id}
                            onClick={() => canVote && onVote(poll.id, option.id)}
                            disabled={!canVote}
                            className={`w-full text-left relative overflow-hidden rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${!canVote
                                    ? "cursor-not-allowed opacity-60"
                                    : isSelected
                                        ? isDarkMode
                                            ? "border-blue-400 bg-gradient-to-r from-blue-900/30 to-blue-800/30 shadow-lg shadow-blue-500/20"
                                            : "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20"
                                        : isDarkMode
                                            ? "border-gray-600 hover:border-gray-500 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/30"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative z-10 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            {isSelected ? (
                                                <div className="relative">
                                                    <CheckCircle className="h-6 w-6 text-blue-500 drop-shadow-lg" />
                                                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping scale-75 opacity-25"></div>
                                                </div>
                                            ) : (
                                                <Circle className={`h-6 w-6 transition-colors duration-200 ${canVote ? "text-gray-400 group-hover:text-blue-400" : "text-gray-300"
                                                    }`} />
                                            )}
                                        </div>
                                        <span className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            {option.text}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-white/70"
                                        } backdrop-blur-sm`}>
                                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                            {option.votes.length}
                                        </span>
                                        {shouldShowResults && (
                                            <span className="text-sm font-medium text-blue-500">
                                                ({percentage.toFixed(0)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {shouldShowResults && (
                                    <div className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
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
                            onClick={() => onViewResults(poll)}
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
                    {poll.createdByName} • {poll.createdAt.toLocaleDateString("vi-VN", {
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