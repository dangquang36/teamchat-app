import React from "react";
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

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
    otherUser?: UserProfile;
    isDarkMode?: boolean;
}

export function ChatMessages({ messages, currentUser, otherUser, isDarkMode = false }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const defaultAvatar = '/placeholder.svg?text=?';

    return (
        <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors 
                        ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}
                        scrollbar-thin 
                        scrollbar-track-transparent 
                        scrollbar-thumb-transparent 
                        hover:scrollbar-thumb-gray-600
                        scrollbar-thumb-rounded-full
                        `}
        >
            {messages.map((msg) => {
                const isMyMessage = msg.from === currentUser.id;

                return (
                    <motion.div
                        key={msg.id}
                        className={`flex w-full ${isMyMessage ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={`flex items-start gap-3 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            <img
                                src={isMyMessage ? currentUser.avatar : (otherUser?.avatar || defaultAvatar)}
                                alt={isMyMessage ? currentUser.name : (otherUser?.name || 'User')}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />

                            <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {isMyMessage ? currentUser.name : (otherUser?.name || 'User')}
                                    </span>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</span>
                                </div>

                                <div className={`p-3 rounded-lg shadow-sm max-w-md break-words ${isMyMessage
                                    ? 'bg-purple-500 text-white rounded-br-none'
                                    : (isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800') + ' rounded-bl-none'
                                    }`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}