import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { PollMessage } from "@/components/modals/PollMessage";
import { Message, Poll } from "@/app/types";

interface ChannelMessage extends Message {
    type?: 'text' | 'poll';
    poll?: Poll;
}

interface Group {
    id: string;
    name: string;
    members: number;
    description: string;
    pinnedMessages: { id: string; text: string; time: string; from: string; reactions: any[] }[];
}

interface ChannelViewProps {
    channel: Group;
    isDarkMode?: boolean;
    messages: ChannelMessage[];
    onSendMessage: (text: string) => void;
    onCreatePoll: (pollData: { question: string; options: string[] }) => void;
    onVote: (messageId: string, optionIndex: number) => void;
}

export function ChannelView({
    channel,
    isDarkMode = false,
    messages,
    onSendMessage,
    onCreatePoll,
    onVote
}: ChannelViewProps) {
    const [showDetails, setShowDetails] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userVotes, setUserVotes] = useState<Record<string, number>>({});

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleVote = (messageId: string, optionIndex: number) => {
        if (userVotes[messageId] !== undefined) return; // Đã bình chọn rồi

        setUserVotes(prev => ({
            ...prev,
            [messageId]: optionIndex
        }));

        onVote(messageId, optionIndex);
    };

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Header */}
            <div
                className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <div>
                    <h2
                        className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        # {channel.name}
                    </h2>
                    <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                    >
                        {channel.members} Thành viên
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className={`${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Info className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <div
                className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
                    }`}
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div
                            className={`text-center p-8 rounded-lg ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-500"
                                }`}
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                Chào mừng đến với kênh #{channel.name}!
                            </h3>
                            <p className="mb-4">
                                Đây là nơi bắt đầu cuộc trò chuyện với mọi người trong kênh.
                            </p>
                            <Button
                                onClick={() => onCreatePoll({
                                    question: "Chúng ta nên bắt đầu từ đâu?",
                                    options: ["Tạo kế hoạch dự án", "Giới thiệu bản thân", "Tập trung vào mục tiêu"]
                                })}
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                                Tạo bình chọn đầu tiên
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => {
                            if (message.type === 'poll' && message.poll) {
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <PollMessage
                                            id={message.id}
                                            question={message.poll.question}
                                            options={message.poll.options}
                                            time={message.time}
                                            onVote={(optionIndex) => handleVote(message.id, optionIndex)}
                                            isMyMessage={message.from === 'me'}
                                            isDarkMode={isDarkMode}
                                            votedOption={userVotes[message.id]}
                                        />
                                    </div>
                                );
                            }

                            // Regular text message
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-md rounded-lg px-4 py-2 shadow-sm ${message.from === 'me'
                                            ? isDarkMode
                                                ? 'bg-purple-800 text-white'
                                                : 'bg-purple-500 text-white'
                                            : isDarkMode
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-white text-gray-800'
                                            }`}
                                    >
                                        <p>{message.text}</p>
                                        <p
                                            className={`text-xs mt-1 ${message.from === 'me'
                                                ? 'text-purple-200'
                                                : isDarkMode
                                                    ? 'text-gray-400'
                                                    : 'text-gray-500'
                                                }`}
                                        >
                                            {message.time}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <ChatInput
                onSendMessage={onSendMessage}
                onCreatePoll={onCreatePoll}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}