import React from 'react';
import { BarChart2 } from 'lucide-react';

interface PollOption {
    text: string;
    votes: number;
}

interface PollProps {
    id: string;
    question: string;
    options: PollOption[];
    time: string;
    onVote: (optionIndex: number) => void;
    isMyMessage: boolean;
    isDarkMode?: boolean;
    votedOption?: number;
}

export function PollMessage({
    id,
    question,
    options,
    time,
    onVote,
    isMyMessage,
    isDarkMode = false,
    votedOption
}: PollProps) {
    const totalVotes = options.reduce((sum, option) => sum + option.votes, 0);

    const getVotePercentage = (votes: number): number => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    return (
        <div
            className={`rounded-lg p-4 shadow-md w-full max-w-md poll-container ${isMyMessage
                ? isDarkMode ? "bg-purple-800 text-white" : "bg-purple-500 text-white"
                : isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                } ${votedOption !== undefined ? "poll-voted" : ""}`}
        >
            <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="h-5 w-5" />
                <span className="font-semibold">{question}</span>
            </div>

            <div className="space-y-3">
                {options.map((option, index) => {
                    const percentage = getVotePercentage(option.votes);
                    const hasVoted = votedOption === index;

                    return (
                        <div
                            key={index}
                            className={`poll-option ${hasVoted ? "voted-option" : ""}`}
                        >
                            <div className="relative h-10 rounded-md overflow-hidden">
                                <div
                                    className={`absolute inset-0 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                                ></div>

                                <div
                                    className={`absolute inset-y-0 left-0 poll-progress-bar ${isMyMessage
                                        ? isDarkMode ? "bg-purple-600" : "bg-purple-300"
                                        : isDarkMode ? "bg-gray-600" : "bg-purple-100"
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>

                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                    <span className={`text-sm ${hasVoted ? "font-bold" : ""}`}>
                                        {hasVoted && "✓ "}{option.text}
                                    </span>
                                    <span className="text-sm font-medium bg-gray-800 bg-opacity-20 px-2 py-0.5 rounded-full">
                                        {percentage}%
                                    </span>
                                </div>

                                <button
                                    onClick={() => onVote(index)}
                                    disabled={votedOption !== undefined}
                                    className="poll-vote-button"
                                    aria-label={`Vote for ${option.text}`}
                                >
                                    <span className="sr-only">Vote for {option.text}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs opacity-80">
                <span>{totalVotes} lượt bình chọn</span>
                <span>{time}</span>
            </div>
        </div>
    );
}
