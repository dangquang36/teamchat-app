import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Vote } from "lucide-react";
import { ChatMessagesProps, Message } from "@/lib/src/types";


interface PollOption {
    text: string;
    votes: number;
}

interface Poll {
    question: string;
    options: PollOption[];
    voters: string[];
}

interface ExtendedMessage extends Message {
    from: string;
    text?: string;
    time: string;
    type?: string;
    poll?: Poll;
}

interface ExtendedChatMessagesProps extends ChatMessagesProps {
    messages: ExtendedMessage[];
}


export function ChatMessages({ messages, currentUser, isDarkMode = false }: ExtendedChatMessagesProps) {
    const [pollVotes, setPollVotes] = useState<Record<string, number[]>>({});


    const handleVote = (messageIndex: number, optionIndex: number) => {
        setPollVotes((prev) => ({
            ...prev,
            [messageIndex]: [...(prev[messageIndex] || []), optionIndex],
        }));
    };

    return (
        <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
        >
            {messages.map((msg, index) => {
                const isMyMessage = msg.from === "me";

                if (msg.type === "poll" && msg.poll) {
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMyMessage ? "justify-end" : "items-start space-x-3"}`}
                        >
                            {isMyMessage ? (
                                <div
                                    className={`rounded-lg p-3 shadow-sm max-w-md ${isDarkMode ? "bg-purple-500 text-white" : "bg-purple-500 text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Vote className="h-5 w-5" />
                                        <span className="font-semibold">{msg.poll.question}</span>
                                    </div>
                                    {msg.poll.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center justify-between mb-1">
                                            <span>{option.text}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleVote(index, optIndex)}
                                                disabled={pollVotes[index]?.includes(optIndex)}
                                            >
                                                {option.votes + (pollVotes[index]?.filter((v: number) => v === optIndex).length || 0)} votes
                                            </Button>
                                        </div>
                                    ))}
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
                                                className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                            >
                                                {currentUser.name}
                                            </span>
                                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                {msg.time}
                                            </span>
                                        </div>
                                        <div
                                            className={`rounded-lg p-3 shadow-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Vote className="h-5 w-5" />
                                                <span className="font-semibold">{msg.poll.question}</span>
                                            </div>
                                            {msg.poll.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center justify-between mb-1">
                                                    <span>{option.text}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleVote(index, optIndex)}
                                                        disabled={pollVotes[index]?.includes(optIndex)}
                                                    >
                                                        {option.votes + (pollVotes[index]?.filter((v) => v === optIndex).length || 0)} votes
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                }
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
                                            className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                        >
                                            {currentUser.name}
                                        </span>
                                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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