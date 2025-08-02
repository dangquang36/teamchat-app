import React from "react";
// Removed framer-motion - using CSS transitions only
import { useEffect, useRef, useState } from 'react';
import { FileText, Download, Image as ImageIcon, Reply, MoreHorizontal } from 'lucide-react';
import type { Message, UserProfile } from "@/app/types";
import { EmojiReactionPicker, EmojiReactionsDisplay, EmojiReactionButton } from '../EmojiReactionPicker';
import { ReplyDisplay } from '../ReplyDisplay';

import { MessageReplyDisplay } from '../MessageReplyDisplay';

interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    otherUser?: UserProfile;
    isDarkMode?: boolean;
    setViewingProfile?: (user: UserProfile | null) => void;
    onReaction?: (messageId: string, emoji: string) => void;
    onReply?: (message: Message) => void;
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ChatMessages({ messages, currentUser, otherUser, isDarkMode = false, setViewingProfile, onReaction, onReply }: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [emojiPickerVisibleId, setEmojiPickerVisibleId] = useState<string | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const defaultAvatar = '/placeholder.svg?text=?';

    const handleReactionSelect = (messageId: string, emoji: string) => {
        if (onReaction) {
            onReaction(messageId, emoji);
        }
        // Đóng picker sau khi chọn emoji
        setEmojiPickerVisibleId(null);
    };

    const handleReactionClick = (messageId: string, emoji: string) => {
        if (onReaction) {
            onReaction(messageId, emoji);
        }
    };

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
                    <div
                        key={msg.id}
                        className={`group flex w-full animate-in slide-in-from-bottom-1 duration-200 ${isMyMessage ? "justify-end" : "justify-start"} relative`}

                    >
                        <div className={`flex items-start gap-3 max-w-[70%] ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} relative`}>
                            <button
                                onClick={() => {
                                    if (sender && !isMyMessage) {
                                        // Chỉ cho phép xem profile của người khác, không phải mình
                                        setViewingProfile?.(sender);
                                    }
                                }}
                                className="group cursor-pointer hover-scale transition-transform"
                            >
                                <img
                                    src={sender?.avatar || defaultAvatar}
                                    alt={sender?.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                                />
                            </button>

                            <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-center space-x-2 mb-1 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <button
                                        onClick={() => {
                                            if (sender && !isMyMessage) {
                                                setViewingProfile?.(sender);
                                            }
                                        }}
                                        className={`text-sm font-medium transition-all duration-200 ${!isMyMessage
                                            ? `hover:text-cyan-500 cursor-pointer hover-scale-sm ${isDarkMode ? "text-white" : "text-gray-900"}`
                                            : isDarkMode ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {sender?.name || 'User'}
                                    </button>
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</span>
                                </div>

                                <div className="space-y-2">
                                    {/* Hiển thị reply nếu có */}
                                    {msg.replyTo && (
                                        <MessageReplyDisplay
                                            replyTo={msg.replyTo}
                                            isDarkMode={isDarkMode}
                                            isMyMessage={isMyMessage}
                                        />
                                    )}

                                    {/* Hiển thị attachments */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            {msg.attachments.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="animate-in zoom-in duration-200"
                                                    style={{ animationDelay: `${index * 50}ms` }}
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

                                                            {/* Combined Actions for Image - Like Button + Message Actions */}
                                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMyMessage ? '-left-2' : '-right-2'} ${isMyMessage ? '-translate-x-full' : 'translate-x-full'} flex items-center ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
                                                                {/* Emoji Reaction Button */}
                                                                <EmojiReactionButton
                                                                    onEmojiPickerToggle={() => {
                                                                        setEmojiPickerVisibleId(
                                                                            emojiPickerVisibleId === msg.id ? null : msg.id
                                                                        );
                                                                    }}
                                                                    isPickerVisible={emojiPickerVisibleId === msg.id}
                                                                    onReactionSelect={(emoji) => handleReactionSelect(msg.id, emoji)}
                                                                    isDarkMode={isDarkMode}
                                                                    isMyMessage={isMyMessage}
                                                                />

                                                                {/* Reply Button */}
                                                                <button
                                                                    onClick={() => onReply && onReply(msg)}
                                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                                    title="Trả lời"
                                                                >
                                                                    <Reply className="h-4 w-4" />
                                                                </button>

                                                                {/* More Options Button */}
                                                                <button
                                                                    onClick={() => {
                                                                        // TODO: Implement more options menu
                                                                        console.log('More options clicked');
                                                                    }}
                                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                                    title="Thêm tùy chọn"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative group">
                                                            <a
                                                                href={file.url}
                                                                download={file.name}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-3 p-3 rounded-lg w-64 cursor-pointer shadow-md transition-all duration-200 border hover-scale-sm ${isDarkMode
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
                                                            </a>

                                                            {/* Combined Actions for File - Like Button + Message Actions */}
                                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMyMessage ? '-left-2' : '-right-2'} ${isMyMessage ? '-translate-x-full' : 'translate-x-full'} flex items-center ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
                                                                {/* Emoji Reaction Button */}
                                                                <EmojiReactionButton
                                                                    onEmojiPickerToggle={() => {
                                                                        setEmojiPickerVisibleId(
                                                                            emojiPickerVisibleId === msg.id ? null : msg.id
                                                                        );
                                                                    }}
                                                                    isPickerVisible={emojiPickerVisibleId === msg.id}
                                                                    onReactionSelect={(emoji) => handleReactionSelect(msg.id, emoji)}
                                                                    isDarkMode={isDarkMode}
                                                                    isMyMessage={isMyMessage}
                                                                />

                                                                {/* Reply Button */}
                                                                <button
                                                                    onClick={() => onReply && onReply(msg)}
                                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                                    title="Trả lời"
                                                                >
                                                                    <Reply className="h-4 w-4" />
                                                                </button>

                                                                {/* More Options Button */}
                                                                <button
                                                                    onClick={() => {
                                                                        // TODO: Implement more options menu
                                                                        console.log('More options clicked');
                                                                    }}
                                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                                    title="Thêm tùy chọn"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hiển thị text message */}
                                    {msg.text && (
                                        <div className="relative group">
                                            <div
                                                className={`p-3 rounded-lg shadow-sm max-w-md break-words transition-all duration-200 hover-scale-sm animate-in zoom-in duration-200 relative
                                                    ${isMyMessage
                                                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-none shadow-lg hover:shadow-xl'
                                                        : (isDarkMode
                                                            ? 'bg-gray-800 text-white border border-gray-700 hover:border-gray-600'
                                                            : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
                                                        ) + ' rounded-bl-none'
                                                    }`}
                                            >
                                                <p className="leading-relaxed">{msg.text}</p>
                                            </div>

                                            {/* Combined Actions - Like Button + Message Actions */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 ${isMyMessage ? '-left-2' : '-right-2'} ${isMyMessage ? '-translate-x-full' : 'translate-x-full'} flex items-center ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
                                                {/* Emoji Reaction Button */}
                                                <EmojiReactionButton
                                                    onEmojiPickerToggle={() => {
                                                        setEmojiPickerVisibleId(
                                                            emojiPickerVisibleId === msg.id ? null : msg.id
                                                        );
                                                    }}
                                                    isPickerVisible={emojiPickerVisibleId === msg.id}
                                                    onReactionSelect={(emoji) => handleReactionSelect(msg.id, emoji)}
                                                    isDarkMode={isDarkMode}
                                                    isMyMessage={isMyMessage}
                                                />

                                                {/* Reply Button */}
                                                <button
                                                    onClick={() => onReply && onReply(msg)}
                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                    title="Trả lời"
                                                >
                                                    <Reply className="h-4 w-4" />
                                                </button>

                                                {/* More Options Button */}
                                                <button
                                                    onClick={() => {
                                                        // TODO: Implement more options menu
                                                        console.log('More options clicked');
                                                    }}
                                                    className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                                                    title="Thêm tùy chọn"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}



                                </div>

                                {/* Hiển thị reactions hiện có */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                    <EmojiReactionsDisplay
                                        reactions={msg.reactions}
                                        currentUserId={currentUser.id}
                                        onReactionClick={(emoji) => handleReactionClick(msg.id, emoji)}
                                        isDarkMode={isDarkMode}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}