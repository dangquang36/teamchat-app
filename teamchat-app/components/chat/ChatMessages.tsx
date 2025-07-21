import React from "react";
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

// Định nghĩa các interface cần thiết
interface Reaction {
    emoji: string;
    user: string;
}

interface Message {
    id: string;
    from: string;
    text?: string;
    time: string;
    reactions: Reaction[];
    type?: 'text';
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
}

export function ChatMessages({ messages, currentUser, isDarkMode = false }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div
            className={`flex-1 overflow-hidden p-4 space-y-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
        >
            {messages.map((msg) => {
                const isMyMessage = msg.from === "me";

                return (
                    <motion.div
                        key={msg.id}
                        className={`flex ${isMyMessage ? "justify-end" : "items-start space-x-3"}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isMyMessage ? (
                            <div className="bg-purple-500 text-white rounded-lg px-4 py-2 max-w-md shadow-lg">
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
                                        <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentUser.name}</span>
                                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</span>
                                    </div>
                                    <div className={`rounded-lg p-3 shadow-sm ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                );
            })}

            {/* Phần cuộn tự động */}
            <div ref={messagesEndRef} />
        </div>
    );
}