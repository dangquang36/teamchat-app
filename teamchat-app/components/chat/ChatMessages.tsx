import React from "react";
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import type { Message, UserProfile } from "@/app/types";

interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    otherUser?: UserProfile;
    isDarkMode?: boolean;
    setViewingProfile?: (user: UserProfile | null) => void;
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ChatMessages({ messages, currentUser, otherUser, isDarkMode = false, setViewingProfile }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const defaultAvatar = '/placeholder.svg?text=?';

    return (
        <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors 
                        ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}
                        scrollbar-none
                        `}
        >
            {messages.map((msg) => {
                const isMyMessage = msg.from === currentUser.id;
                const sender = isMyMessage ? currentUser : otherUser;

                return (
                    <motion.div
                        key={msg.id}
                        className={`flex w-full ${isMyMessage ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className={`flex items-start gap-3 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                            <motion.button
                                onClick={() => {
                                    if (sender && !isMyMessage) {
                                        // Chỉ cho phép xem profile của người khác, không phải mình
                                        setViewingProfile?.(sender);
                                    }
                                }}
                                className="group cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img
                                    src={sender?.avatar || defaultAvatar}
                                    alt={sender?.name || 'User'}
                                    className={`w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm ${!isMyMessage ? 'group-hover:ring-2 group-hover:ring-cyan-400 transition-all duration-200' : ''
                                        }`}
                                />
                            </motion.button>

                            <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center space-x-2 mb-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <motion.button
                                        onClick={() => {
                                            if (sender && !isMyMessage) {
                                                setViewingProfile?.(sender);
                                            }
                                        }}
                                        className={`text-sm font-medium transition-colors duration-200 ${!isMyMessage
                                            ? `hover:text-cyan-500 cursor-pointer ${isDarkMode ? "text-white" : "text-gray-900"}`
                                            : isDarkMode ? "text-white" : "text-gray-900"
                                            }`}
                                        whileHover={!isMyMessage ? { scale: 1.02 } : {}}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {sender?.name || 'User'}
                                    </motion.button>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</span>
                                </div>

                                <div className="space-y-2">
                                    {/* Hiển thị attachments */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            {msg.attachments.map((file, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                >
                                                    {file.type.startsWith('image/') ? (
                                                        <div className="relative group">
                                                            <img
                                                                src={file.url}
                                                                alt={file.name}
                                                                className="max-w-xs max-h-60 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-cyan-400 transition-all duration-200 shadow-md"
                                                                onClick={() => window.open(file.url, '_blank')}
                                                                onError={(e) => {
                                                                    console.error('Image load error:', e);
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <ImageIcon className="h-8 w-8 text-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <motion.a
                                                            href={file.url}
                                                            download={file.name}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={`flex items-center gap-3 p-3 rounded-lg w-64 cursor-pointer shadow-md transition-all duration-200 border
                                                                ${isDarkMode
                                                                    ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-cyan-500'
                                                                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-cyan-400'
                                                                }`}
                                                        >
                                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                                                                ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                                                                <FileText className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                                    {file.name}
                                                                </p>
                                                                {file.size && (
                                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {formatFileSize(file.size)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Download className={`h-4 w-4 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        </motion.a>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hiển thị text message */}
                                    {msg.text && (
                                        <motion.div
                                            className={`p-3 rounded-lg shadow-sm max-w-md break-words
                                                ${isMyMessage
                                                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-none shadow-lg'
                                                    : (isDarkMode
                                                        ? 'bg-gray-800 text-white border border-gray-700'
                                                        : 'bg-white text-gray-800 border border-gray-200'
                                                    ) + ' rounded-bl-none'
                                                }`}
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover={isMyMessage ? {
                                                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)"
                                            } : {}}
                                        >
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </motion.div>
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