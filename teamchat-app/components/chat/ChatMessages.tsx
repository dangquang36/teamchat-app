import React from "react";
import { Button } from "@/components/ui/button";
import { Vote } from "lucide-react";

// Định nghĩa các interface cần thiết
interface Reaction {
    emoji: string;
    user: string;
}

interface PollOption {
    text: string;
    votes: number;
    voters: string[];
}

interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    allowMultipleVotes?: boolean;
    createdBy: string;
    createdAt: string;
}

interface Message {
    id: string;
    from: string;
    text?: string;
    time: string;
    reactions: Reaction[];
    type?: 'text' | 'poll';
    poll?: Poll;
}

interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
}

interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    isDarkMode?: boolean;
    onVote?: (messageId: string, optionIndex: number) => void;
}

export function ChatMessages({
    messages,
    currentUser,
    isDarkMode = false,
    onVote
}: ChatMessagesProps) {
    const handleVote = (messageId: string, optionIndex: number) => {
        if (!onVote) return;
        onVote(messageId, optionIndex);
    };

    const getVotePercentage = (votes: number, totalVotes: number) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    const hasUserVoted = (voters: string[], currentUserId: string) => {
        return voters.includes(currentUserId);
    };

    return (
        <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
        >
            {messages.map((msg) => {
                const isMyMessage = msg.from === "me";

                if (msg.type === "poll" && msg.poll) {
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMyMessage ? "justify-end" : "items-start space-x-3"}`}
                        >
                            {!isMyMessage && (
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            )}
                            <div className="flex-1 max-w-md">
                                {!isMyMessage && (
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span
                                            className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                            {currentUser.name}
                                        </span>
                                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                )}

                                {/* Poll Component */}
                                <div className={`rounded-lg p-4 shadow-sm ${isMyMessage
                                    ? (isDarkMode ? "bg-purple-600" : "bg-purple-500")
                                    : (isDarkMode ? "bg-gray-700" : "bg-white")
                                    }`}>
                                    {/* Poll Header */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Vote className={`h-5 w-5 ${isMyMessage ? "text-purple-200" : "text-blue-500"}`} />
                                        <span className={`font-semibold ${isMyMessage
                                            ? "text-white"
                                            : (isDarkMode ? "text-white" : "text-gray-900")
                                            }`}>
                                            {msg.poll.question}
                                        </span>
                                    </div>

                                    {/* Poll Options */}
                                    <div className="space-y-2 mb-3">
                                        {msg.poll.options.map((option, index) => {
                                            const percentage = getVotePercentage(option.votes, msg.poll!.totalVotes);
                                            const userVoted = hasUserVoted(option.voters, "me");

                                            return (
                                                <div key={index} className="relative">
                                                    <button
                                                        onClick={() => handleVote(msg.id, index)}
                                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${userVoted
                                                            ? (isDarkMode ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50")
                                                            : (isDarkMode ? "border-gray-600 bg-gray-800 hover:bg-gray-700" : "border-gray-300 bg-gray-50 hover:bg-gray-100")
                                                            } cursor-pointer`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className={`${isMyMessage
                                                                ? "text-white"
                                                                : (isDarkMode ? "text-white" : "text-gray-900")
                                                                }`}>
                                                                {option.text}
                                                            </span>
                                                            <span className={`text-sm font-medium ${isMyMessage
                                                                ? "text-purple-200"
                                                                : (isDarkMode ? "text-gray-400" : "text-gray-600")
                                                                }`}>
                                                                {option.votes} ({percentage}%)
                                                            </span>
                                                        </div>

                                                        {/* Progress bar */}
                                                        <div className={`mt-2 h-2 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-200"
                                                            }`}>
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${userVoted ? "bg-green-500" : "bg-blue-500"
                                                                    }`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Poll Footer */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`${isMyMessage
                                            ? "text-purple-200"
                                            : (isDarkMode ? "text-gray-400" : "text-gray-500")
                                            }`}>
                                            {msg.poll.totalVotes} lượt bình chọn
                                        </span>
                                        <span className={`${isMyMessage
                                            ? "text-purple-200"
                                            : (isDarkMode ? "text-gray-400" : "text-gray-500")
                                            }`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                // Regular text messages
                return (
                    <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "items-start space-x-3"}`}>
                        {isMyMessage ? (
                            <div className="bg-purple-500 text-white rounded-lg px-4 py-2 max-w-md">
                                <p>{msg.text}</p>
                                <div className="text-xs opacity-75 mt-1 text-right">{msg.time}</div>
                            </div>
                        ) : (
                            <>
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span
                                            className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                            {currentUser.name}
                                        </span>
                                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                    <div
                                        className={`rounded-lg p-3 shadow-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}