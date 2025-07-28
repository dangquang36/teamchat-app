'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Poll } from './PollMessage';

interface PollResultsModalProps {
    poll: Poll;
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

export function PollResultsModal({
    poll,
    isOpen,
    onClose,
    isDarkMode,
}: PollResultsModalProps) {
    if (!isOpen) return null;

    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg mx-4 rounded-xl max-h-[80vh] overflow-hidden shadow-2xl ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`}>
                <div className={`p-5 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Kết quả bình chọn
                        </h3>
                        <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-gray-100 dark:hover:bg-gray-700">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {poll.question}
                    </p>
                </div>

                <div className="overflow-y-auto max-h-96">
                    {poll.options.map((option) => {
                        const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;

                        return (
                            <div key={option.id} className={`p-5 border-b last:border-b-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"
                                }`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-gray-900"
                                        }`}>
                                        {option.text}
                                    </span>
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                                            }`}>
                                            {option.votes.length} vote
                                        </div>
                                        <div className="text-xs text-blue-500 font-medium">
                                            {percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                <div className={`w-full h-2 rounded-full mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                    }`}>
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                {option.votes.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                            }`}>
                                            Người đã bình chọn:
                                        </h4>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {option.votes.map((vote) => (
                                                <div key={`${vote.userId}-${vote.votedAt.getTime()}`}
                                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isDarkMode
                                                            ? "bg-gray-700/50 hover:bg-gray-700"
                                                            : "bg-gray-50 hover:bg-gray-100"
                                                        }`}>
                                                    <img
                                                        src={vote.userAvatar}
                                                        alt={vote.userName}
                                                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                                                            }`}>
                                                            {vote.userName}
                                                        </span>
                                                        <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                                            }`}>
                                                            {vote.votedAt.toLocaleString("vi-VN", {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                    {vote.userId === "user-current" && (
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDarkMode
                                                                ? "bg-blue-500/20 text-blue-300"
                                                                : "bg-blue-100 text-blue-600"
                                                            }`}>
                                                            Bạn
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {option.votes.length === 0 && (
                                    <div className={`text-center py-3 text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                        }`}>
                                        Chưa có ai bình chọn tùy chọn này
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={`p-5 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between text-sm">
                        <div className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <span className="font-semibold">{poll.totalVoters}</span> người đã tham gia
                        </div>
                        <div className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Tạo bởi <span className="font-medium">{poll.createdByName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}