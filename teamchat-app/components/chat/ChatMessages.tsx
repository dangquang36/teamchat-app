import React from "react";
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { FileText, Download } from 'lucide-react';
import type { Message, UserProfile } from "@/app/types";

interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    otherUser?: UserProfile;
    isDarkMode?: boolean;
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
                        scrollbar-thin scrollbar-track-transparent 
                        hover:scrollbar-thumb-gray-600 scrollbar-thumb-rounded-full`}
        >
            {messages.map((msg) => {
                const isMyMessage = msg.from === currentUser.id;
                const sender = isMyMessage ? currentUser : otherUser;

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
                                src={sender?.avatar || defaultAvatar}
                                alt={sender?.name || 'User'}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />

                            <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                        {sender?.name || 'User'}
                                    </span>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</span>
                                </div>

                                <div className={`max-w-md break-words`}>
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="grid gap-2 mb-1">
                                            {msg.attachments.map((file, index) => (
                                                <div key={index}>
                                                    {file.type.startsWith('image/') ? (
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="max-w-xs max-h-60 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-purple-400 transition"
                                                            onClick={() => window.open(file.url, '_blank')}
                                                        />
                                                    ) : (
                                                        <a
                                                            href={file.url}
                                                            download={file.name}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex items-center gap-3 p-3 rounded-lg w-64
                                                                ${isMyMessage
                                                                    ? 'bg-purple-400 hover:bg-purple-300'
                                                                    : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')} 
                                                                transition-colors`}
                                                        >
                                                            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                                <FileText className={isMyMessage ? "text-white" : "text-gray-500"} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium text-sm truncate ${isMyMessage ? 'text-white' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>
                                                                    {file.name}
                                                                </p>
                                                                {file.size && (
                                                                    <p className={`text-xs ${isMyMessage ? 'text-purple-100' : 'text-gray-500'}`}>
                                                                        {formatFileSize(file.size)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Download className={`h-5 w-5 flex-shrink-0 ${isMyMessage ? 'text-purple-100' : 'text-gray-500'}`} />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.text && (
                                        <div className={`p-3 rounded-lg shadow-sm
                                            ${isMyMessage
                                                ? 'bg-purple-500 text-white rounded-br-none'
                                                : (isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800') + ' rounded-bl-none'
                                            }`}
                                        >
                                            <p>{msg.text}</p>
                                        </div>
                                    )}
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
