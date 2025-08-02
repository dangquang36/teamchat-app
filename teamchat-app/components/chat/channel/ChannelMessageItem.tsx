'use client';

import { useState } from 'react';
import { Paperclip as FileMessageIcon } from 'lucide-react';
import { PollMessage, Poll } from '@/components/chat/poll/PollMessage';
import { EmojiReactionPicker, EmojiReactionsDisplay } from '../EmojiReactionPicker';
import { ReplyDisplay } from '../ReplyDisplay';
import { SimpleMessageActions } from '../SimpleMessageActions';
import { ChannelMessage } from '@/contexts/ChannelContext';

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
}

interface ChannelMessageItemProps {
    message: ChannelMessage;
    currentUserId: string;
    isDarkMode: boolean;
    onViewProfile: (user: UserProfile) => void;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
    onReaction?: (messageId: string, emoji: string) => void;
    onReply?: (message: ChannelMessage) => void;
}

export function ChannelMessageItem({
    message,
    currentUserId,
    isDarkMode,
    onViewProfile,
    onVote,
    onViewResults,
    onReaction,
    onReply,
}: ChannelMessageItemProps) {
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
                    src={message.sender.avatar || '/placeholder-user.jpg'}
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

                <div className="relative group">
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

                    {/* Hiển thị thông báo bài đăng */}
                    {message.type === 'post_notification' && message.postData && (
                        <div className={`rounded-lg p-4 max-w-md relative ${isDarkMode
                            ? "bg-blue-900/20 border border-blue-600/30 text-white"
                            : "bg-blue-50 border border-blue-200 text-gray-800"
                            }`}>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">📝</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-semibold text-sm">
                                            {message.postData.authorName}
                                        </span>
                                        <span className="text-xs opacity-75">
                                            đã đăng bài
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-sm mb-1">
                                        {message.postData.title}
                                    </h4>
                                    {message.postData.excerpt && (
                                        <p className="text-xs opacity-75 line-clamp-2">
                                            {message.postData.excerpt}
                                        </p>
                                    )}
                                    <button
                                        className={`mt-2 px-3 py-1 text-xs rounded-full transition-colors ${isDarkMode
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                                            }`}
                                        onClick={() => {
                                            // TODO: Navigate to post detail
                                            console.log('View post:', message.postData?.postId);
                                        }}
                                    >
                                        Bấm để xem bài
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {message.content && message.type !== 'post_notification' && (
                        <div className={`rounded-lg p-3 max-w-xs md:max-w-md relative ${isCurrentUser
                            ? "bg-purple-500 text-white"
                            : isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-white text-gray-800 shadow-sm"
                            }`}>
                            {message.content}

                            {/* Message Actions - hiển thị khi hover */}
                            <SimpleMessageActions
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

                    {message.fileData && (
                        <div
                            className={`rounded-lg p-3 max-w-xs md:max-w-md relative ${isCurrentUser
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
                                    <p className="font-medium text-sm truncate">{message.fileData.name}</p>
                                    <p className="text-xs opacity-75">
                                        {(message.fileData.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            {/* Message Actions - hiển thị khi hover */}
                            <SimpleMessageActions
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