"use client";

import { useState } from "react";
import { Phone, Video, Download, Paperclip as FileMessageIcon, BarChart3, Plus, X, Users, Clock, CheckCircle, Circle, Eye, MoreHorizontal, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCall } from "../VideoCall";
import { AudioCallModal } from "../AudioCallModal";
import { ChannelInput } from "./ChannelInput";
import { UserProfileModal, UserProfile } from "../UserProfileModal";

interface Group {
    id: string;
    name: string;
    members: number;
}

interface PollOption {
    id: string;
    text: string;
    votes: {
        userId: string;
        userName: string;
        userAvatar: string;
        votedAt: Date;
    }[];
}

interface Poll {
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

interface Message {
    id: number;
    sender: UserProfile;
    text?: string;
    files?: { name: string; size: number }[];
    poll?: Poll;
    timestamp: Date;
}

const otherUser: UserProfile = {
    id: "user-123",
    name: "Victoria Lane",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    coverPhotoUrl: "",
    gender: "Nam",
    birthday: "23/06",
    phone: "*********",
    mutualGroups: 11,
};

const currentUser: UserProfile = {
    id: "user-current",
    name: "Bạn",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    coverPhotoUrl: "",
    gender: "Nam",
    birthday: "01/01",
    phone: "*********",
    mutualGroups: 5,
};

const mockUsers = [
    { id: "user-1", name: "Nguyễn Văn A", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" },
    { id: "user-2", name: "Trần Thị B", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" },
    { id: "user-3", name: "Lê Văn C", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face" },
    { id: "user-4", name: "Phạm Thị D", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" },
];

function PollResultsModal({
    poll,
    isOpen,
    onClose,
    isDarkMode,
}: {
    poll: Poll;
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}) {
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

                                {/* Hiển thị người đã vote */}
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

                                {/* Trường hợp không có vote */}
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

function PollMessage({
    poll,
    currentUserId,
    onVote,
    onViewResults,
    isDarkMode,
}: {
    poll: Poll;
    currentUserId: string;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
    isDarkMode: boolean;
}) {
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
            {/* Header với gradient */}
            <div className={`p-5 border-b ${isDarkMode
                    ? "border-gray-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
                    : "border-gray-200/80 bg-gradient-to-r from-blue-50 to-indigo-50"
                }`}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Cuộc bình chọn</span>
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

                {/* Thông tin với layout cải thiện */}
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

            {/* Options với animation đẹp */}
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
                                        <span className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-gray-900"
                                            }`}>
                                            {option.text}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isDarkMode ? "bg-gray-700/50" : "bg-white/70"
                                        } backdrop-blur-sm`}>
                                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                            }`}>
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
                                    <div className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                        }`}>
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

            {/* Footer tinh tế hơn */}
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

function CreatePollModal({
    isOpen,
    onClose,
    onCreatePoll,
    isDarkMode,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreatePoll: (poll: Omit<Poll, "id" | "createdAt" | "totalVoters">) => void;
    isDarkMode: boolean;
}) {
    const [question, setQuestion] = useState("");
    const [description, setDescription] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showResults, setShowResults] = useState<"always" | "after_vote" | "after_end">("after_vote");
    const [hasEndTime, setHasEndTime] = useState(false);
    const [endTime, setEndTime] = useState("");

    if (!isOpen) return null;

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && options.every((opt) => opt.trim())) {
            const pollEndTime = hasEndTime && endTime ? new Date(endTime) : undefined;

            onCreatePoll({
                question: question.trim(),
                description: description.trim() || undefined,
                options: options.map((opt) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    text: opt.trim(),
                    votes: [],
                })),
                allowMultiple,
                isAnonymous,
                showResults,
                createdBy: currentUser.id,
                createdByName: currentUser.name,
                endTime: pollEndTime,
                isActive: true,
            });

            setQuestion("");
            setDescription("");
            setOptions(["", ""]);
            setAllowMultiple(false);
            setIsAnonymous(false);
            setShowResults("after_vote");
            setHasEndTime(false);
            setEndTime("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md mx-4 rounded-lg max-h-[90vh] overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>Tạo cuộc bình chọn</h3>
                        <Button onClick={onClose} variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="p-4 space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>Câu hỏi bình chọn *</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Nhập câu hỏi bình chọn..."
                                className={`w-full p-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"}`}
                                required
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>Mô tả (tùy chọn)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Thêm mô tả cho cuộc bình chọn..."
                                rows={2}
                                className={`w-full p-3 rounded-lg border resize-none ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"}`}
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>Tùy chọn *</label>
                            <div className="space-y-2">
                                {options.map((option, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={`Tùy chọn ${index + 1}`}
                                            className={`flex-1 p-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900"}`}
                                            required
                                            maxLength={100}
                                        />
                                        {options.length > 2 && (
                                            <Button type="button" onClick={() => removeOption(index)} variant="ghost" size="sm">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {options.length < 10 && (
                                    <Button type="button" onClick={addOption} variant="outline" size="sm" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm tùy chọn
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Cài đặt</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="allowMultiple"
                                        checked={allowMultiple}
                                        onChange={(e) => setAllowMultiple(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="allowMultiple" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>Cho phép chọn nhiều tùy chọn</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isAnonymous"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="isAnonymous" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>Bình chọn ẩn danh</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="hasEndTime"
                                        checked={hasEndTime}
                                        onChange={(e) => setHasEndTime(e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="hasEndTime" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>Đặt thời gian kết thúc</label>
                                </div>
                                {hasEndTime && (
                                    <input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className={`w-full p-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-700"}`}>Hiển thị kết quả</label>
                            <select
                                value={showResults}
                                onChange={(e) => setShowResults(e.target.value as any)}
                                className={`w-full p-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                            >
                                <option value="always">Luôn hiển thị</option>
                                <option value="after_vote">Sau khi bình chọn</option>
                                <option value="after_end">Sau khi kết thúc</option>
                            </select>
                        </div>
                    </div>

                    <div className={`p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex gap-2`}>
                        <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600">
                            Tạo bình chọn
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ChannelViewProps {
    channel: {
        id: string;
        name: string;
        members: number;
    };
    isDarkMode?: boolean;
    onToggleDetails: () => void;
}

export function ChannelView({ channel, isDarkMode = false, onToggleDetails }: ChannelViewProps) {
    const [isCallingVideo, setIsCallingVideo] = useState(false);
    const [audioCallMode, setAudioCallMode] = useState<"none" | "outgoing" | "incoming">("none");
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
    const [isCreatePollModalOpen, setIsCreatePollModalOpen] = useState(false);
    const [pollResultsModal, setPollResultsModal] = useState<{ isOpen: boolean; poll: Poll | null }>({
        isOpen: false,
        poll: null,
    });

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: otherUser,
            text: "Đây là tin nhắn từ người khác.",
            timestamp: new Date(Date.now() - 5000),
        },
        {
            id: 2,
            sender: currentUser,
            text: "Đây là tin nhắn của bạn.",
            timestamp: new Date(Date.now() - 3000),
        },
        {
            id: 3,
            sender: otherUser,
            timestamp: new Date(Date.now() - 1000),
            poll: {
                id: "demo-poll-1",
                question: "Bạn thích màu gì nhất?",
                description: "Hãy chọn màu yêu thích của bạn để chúng tôi biết sở thích của mọi người",
                options: [
                    {
                        id: "option-1",
                        text: "Xanh dương",
                        votes: [
                            { userId: "user-1", userName: "Nguyễn Văn A", userAvatar: mockUsers[0].avatar, votedAt: new Date() },
                            { userId: "user-2", userName: "Trần Thị B", userAvatar: mockUsers[1].avatar, votedAt: new Date() },
                        ],
                    },
                    {
                        id: "option-2",
                        text: "Đỏ",
                        votes: [{ userId: "user-3", userName: "Lê Văn C", userAvatar: mockUsers[2].avatar, votedAt: new Date() }],
                    },
                    {
                        id: "option-3",
                        text: "Xanh lá",
                        votes: [],
                    },
                    {
                        id: "option-4",
                        text: "Vàng",
                        votes: [{ userId: "user-4", userName: "Phạm Thị D", userAvatar: mockUsers[3].avatar, votedAt: new Date() }],
                    },
                ],
                allowMultiple: false,
                isAnonymous: false,
                showResults: "after_vote",
                createdBy: otherUser.id,
                createdByName: otherUser.name,
                createdAt: new Date(Date.now() - 3600000),
                isActive: true,
                totalVoters: 4,
            },
        },
    ]);

    const userName = "User" + Math.floor(Math.random() * 100);

    const generateAutoReply = (userMessage: string): string => {
        return `Đã nhận được tin nhắn: "${userMessage}". Bạn khỏe không?`;
    };

    const handleCreatePoll = (pollData: Omit<Poll, "id" | "createdAt" | "totalVoters">) => {
        const poll: Poll = {
            ...pollData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            totalVoters: 0,
        };

        const pollMessage: Message = {
            id: Date.now(),
            sender: currentUser,
            poll: poll,
            timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, pollMessage]);
    };

    const handleVote = (pollId: string, optionId: string) => {
        setMessages((prevMessages) =>
            prevMessages.map((message) => {
                if (message.poll?.id === pollId) {
                    const poll = message.poll;
                    let updatedOptions = [...poll.options];
                    let totalVoters = poll.totalVoters;

                    const targetOption = updatedOptions.find((opt) => opt.id === optionId);
                    const hasVotedThisOption = targetOption?.votes.some((vote) => vote.userId === currentUser.id);
                    const hasVotedAnyOption = updatedOptions.some((opt) =>
                        opt.votes.some((vote) => vote.userId === currentUser.id)
                    );

                    if (hasVotedThisOption) {
                        updatedOptions = updatedOptions.map((option) => {
                            if (option.id === optionId) {
                                return {
                                    ...option,
                                    votes: option.votes.filter((vote) => vote.userId !== currentUser.id),
                                };
                            }
                            return option;
                        });
                        if (!hasVotedAnyOption) {
                            totalVoters = Math.max(0, totalVoters - 1);
                        }
                    } else {
                        if (!poll.allowMultiple && hasVotedAnyOption) {
                            updatedOptions = updatedOptions.map((option) => ({
                                ...option,
                                votes: option.votes.filter((vote) => vote.userId !== currentUser.id),
                            }));
                        } else if (!hasVotedAnyOption) {
                            totalVoters += 1;
                        }

                        updatedOptions = updatedOptions.map((option) => {
                            if (option.id === optionId) {
                                return {
                                    ...option,
                                    votes: [
                                        ...option.votes,
                                        {
                                            userId: currentUser.id,
                                            userName: currentUser.name,
                                            userAvatar: currentUser.avatarUrl,
                                            votedAt: new Date(),
                                        },
                                    ],
                                };
                            }
                            return option;
                        });
                    }

                    return {
                        ...message,
                        poll: {
                            ...poll,
                            options: updatedOptions,
                            totalVoters,
                        },
                    };
                }
                return message;
            })
        );
    };

    const handleViewResults = (poll: Poll) => {
        setPollResultsModal({ isOpen: true, poll });
    };

    const handleSendMessage = (data: { text: string; files: File[] }) => {
        const { text, files } = data;
        if (!text.trim() && files.length === 0) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentUser,
            text: text,
            files: files.map((file) => ({ name: file.name, size: file.size })),
            timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        if (text.trim()) {
            setTimeout(() => {
                const autoReply: Message = {
                    id: Date.now() + 1,
                    sender: otherUser,
                    text: generateAutoReply(text),
                    timestamp: new Date(),
                };
                setMessages((prevMessages) => [...prevMessages, autoReply]);
            }, 1000);
        }
    };

    const handleViewProfile = (user: UserProfile) => {
        setViewedUser(user);
        setProfileModalOpen(true);
    };

    if (isCallingVideo) {
        return <VideoCall roomName={channel.id} userName={userName} onClose={() => setIsCallingVideo(false)} />;
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div>
                    <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}># {channel.name}</h3>
                    <p className="text-sm text-gray-500">{channel.members} thành viên</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setAudioCallMode("outgoing")} variant="ghost" size="sm" title="Thực hiện cuộc gọi thoại">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button onClick={() => setIsCallingVideo(true)} variant="ghost" size="sm" title="Thực hiện cuộc gọi video">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button onClick={onToggleDetails} variant="ghost" size="sm" title="Xem thông tin kênh">
                        <Info className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div
                className={`flex-1 p-4 space-y-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
                style={{ overflowY: "auto" }}
            >
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">Đây là khởi đầu của kênh #{channel.name}.</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === currentUser.id ? "flex-row-reverse" : ""}`}>
                            <button onClick={() => handleViewProfile(msg.sender)} className="flex-shrink-0 mt-1">
                                <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-8 h-8 rounded-full cursor-pointer" />
                            </button>
                            <div className={`flex flex-col gap-2 ${msg.sender.id === currentUser.id ? "items-end" : "items-start"}`}>
                                <div className={`flex items-center gap-2 text-xs text-gray-500 ${msg.sender.id === currentUser.id ? "flex-row-reverse" : ""}`}>
                                    <span className="font-medium">{msg.sender.name}</span>
                                    <span>{msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>

                                {msg.poll && (
                                    <PollMessage
                                        poll={msg.poll}
                                        currentUserId={currentUser.id}
                                        onVote={handleVote}
                                        onViewResults={handleViewResults}
                                        isDarkMode={isDarkMode}
                                    />
                                )}

                                {msg.text && (
                                    <div
                                        className={`rounded-lg p-3 max-w-xs md:max-w-md ${msg.sender.id === currentUser.id ? "bg-purple-500 text-white" : isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800 shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                )}

                                {msg.files &&
                                    msg.files.map((file, index) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg p-3 max-w-xs md:max-w-md ${msg.sender.id === currentUser.id ? "bg-purple-500 text-white" : isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800 shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-black/10 dark:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileMessageIcon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                                    <p className="text-xs opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )))}
            </div>

            <ChannelInput
                channelName={channel.name}
                onSendMessage={handleSendMessage}
                isDarkMode={isDarkMode}
                isChannel={true}
                onCreatePoll={() => setIsCreatePollModalOpen(true)}
            />

            {audioCallMode !== "none" && (
                <AudioCallModal channelName={channel.name} onClose={() => setAudioCallMode("none")} mode={audioCallMode} />
            )}

            {isProfileModalOpen && viewedUser && (
                <UserProfileModal user={viewedUser} onClose={() => setProfileModalOpen(false)} isDarkMode={isDarkMode} />
            )}

            <CreatePollModal
                isOpen={isCreatePollModalOpen}
                onClose={() => setIsCreatePollModalOpen(false)}
                onCreatePoll={handleCreatePoll}
                isDarkMode={isDarkMode}
            />

            {pollResultsModal.poll && (
                <PollResultsModal
                    poll={pollResultsModal.poll}
                    isOpen={pollResultsModal.isOpen}
                    onClose={() => setPollResultsModal({ isOpen: false, poll: null })}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
}