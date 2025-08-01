'use client';

import { useState } from 'react';
import { Paperclip as FileMessageIcon } from 'lucide-react';
import { PollMessage, Poll } from '@/components/chat/poll/PollMessage';
import { EmojiReactionPicker, EmojiReactionsDisplay } from '../EmojiReactionPicker';
import { ReplyDisplay } from '../ReplyDisplay';
import { MessageActions } from '../MessageActions';
import { Message, Reaction } from '@/app/types';

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
}

export interface ChannelMessage {
    id: number;
    sender: UserProfile;
    text?: string;
    files?: { name: string; size: number }[];
    poll?: Poll;
    timestamp: Date;
    reactions?: Reaction[];
    replyTo?: {
        id: string;
        from: string;
        text?: string;
        type?: 'text' | 'poll' | 'file' | 'image';
    };
}

interface MessageItemProps {
    message: ChannelMessage;
    currentUserId: string;
    isDarkMode: boolean;
    onViewProfile: (user: UserProfile) => void;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
    onReaction?: (messageId: number, emoji: string) => void;
    onReply?: (message: ChannelMessage) => void;
}

export function MessageItem({
    message,
    currentUserId,
    isDarkMode,
    onViewProfile,
    onVote,
    onViewResults,
    onReaction,
    onReply,
}: MessageItemProps) {
    const isCurrentUser = message.sender.id === currentUserId;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleReactionSelect = (emoji: string) => {
        if (onReaction) {
            onReaction(message.id, emoji);
        }
        setShowEmojiPicker(false);
    };

    const handleReactionClick = (emoji: string) => {
        if (onReaction) {
            onReaction(message.id, emoji);
        }
    };

    return (
        <div
            className={`group flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""} relative`}
            onMouseEnter={() => setShowEmojiPicker(true)}
            onMouseLeave={() => setShowEmojiPicker(false)}
        >
            <button onClick={() => onViewProfile(message.sender)} className="flex-shrink-0 mt-1">
                <img
                    src={message.sender.avatarUrl}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full cursor-pointer"
                />
            </button>

            <div className={`flex flex-col gap-2 ${isCurrentUser ? "items-end" : "items-start"} relative`}>
                <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isCurrentUser ? "flex-row-reverse" : ""
                    }`}>
                    <span className="font-medium">{message.sender.name}</span>
                    <span>
                        {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                </div>

                <div className="relative">
                    {/* Hiển thị reply nếu có */}
                    {message.replyTo && (
                        <ReplyDisplay
                            replyTo={message.replyTo}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {message.poll && (
                        <PollMessage
                            poll={message.poll}
                            currentUserId={currentUserId}
                            onVote={onVote}
                            onViewResults={onViewResults}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {message.text && (
                        <div className={`rounded-lg p-3 max-w-xs md:max-w-md relative ${isCurrentUser
                            ? "bg-purple-500 text-white"
                            : isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-white text-gray-800 shadow-sm"
                            }`}>
                            {message.text}

                            {/* Message Actions - hiển thị khi hover */}
                            <MessageActions
                                isCurrentUser={isCurrentUser}
                                isDarkMode={isDarkMode}
                                onReply={() => onReply && onReply(message)}
                                onMoreOptions={() => {
                                    // TODO: Implement more options menu
                                    console.log('More options clicked');
                                }}
                            />
                        </div>
                    )}

                    {message.files && message.files.map((file, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-3 max-w-xs md:max-w-md ${isCurrentUser
                                ? "bg-purple-500 text-white"
                                : isDarkMode
                                    ? "bg-gray-700 text-white"
                                    : "bg-white text-gray-800 shadow-sm"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-black/10 dark:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileMessageIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                    <p className="text-xs opacity-75">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}



                    {/* Emoji Picker - hiển thị khi hover */}
                    <EmojiReactionPicker
                        onReactionSelect={handleReactionSelect}
                        isDarkMode={isDarkMode}
                        isVisible={showEmojiPicker}
                        position="bottom"
                        onMouseEnter={() => setShowEmojiPicker(true)}
                        onMouseLeave={() => {
                            setTimeout(() => setShowEmojiPicker(false), 100);
                        }}
                    />
                </div>

                {/* Hiển thị reactions hiện có */}
                {message.reactions && message.reactions.length > 0 && (
                    <EmojiReactionsDisplay
                        reactions={message.reactions}
                        currentUserId={currentUserId}
                        onReactionClick={handleReactionClick}
                        isDarkMode={isDarkMode}
                    />
                )}
            </div>
        </div>
    );
}