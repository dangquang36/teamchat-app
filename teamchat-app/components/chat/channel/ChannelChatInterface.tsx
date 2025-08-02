"use client";

import React, { useState } from 'react';
import { MessageList } from '../messages/MessageList';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, Reply } from 'lucide-react';
import { ReplyPreview } from '../ReplyPreview';

interface ChannelChatInterfaceProps {
    channelId: string;
    isDarkMode?: boolean;
}

export function ChannelChatInterface({ channelId, isDarkMode = false }: ChannelChatInterfaceProps) {
    const { getChannel, addMessageToChannel, addEmojiReaction } = useChannels();
    const currentUser = useCurrentUser();
    const channel = getChannel(channelId);
    const [messageInput, setMessageInput] = useState('');

    // State cho reply
    const [replyingTo, setReplyingTo] = useState<{
        id: string;
        from: string;
        content?: string;
        type?: 'text' | 'image' | 'file' | 'meeting' | 'poll' | 'post_notification';
    } | null>(null);

    if (!channel || !currentUser) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Channel not found or user not logged in</p>
            </div>
        );
    }

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            addMessageToChannel(channelId, {
                content: messageInput,
                sender: {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar || '/default-avatar.png'
                },
                type: 'text',
                // Thêm reply nếu có
                ...(replyingTo && {
                    replyTo: {
                        id: replyingTo.id,
                        from: replyingTo.from,
                        content: replyingTo.content,
                        type: replyingTo.type
                    }
                })
            });
            setMessageInput('');
            setReplyingTo(null); // Reset reply sau khi gửi
        }
    };

    const handleEmojiReaction = (messageId: number, emoji: string) => {
        addEmojiReaction(channelId, messageId, emoji, currentUser.id);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Hàm xử lý reply
    const handleReply = (message: any) => {
        setReplyingTo({
            id: message.id,
            from: message.sender.name,
            content: message.content,
            type: message.type
        });
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`border-b p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    #{channel.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {channel.description}
                </p>
            </div>

            {/* Messages */}
            <MessageList
                messages={channel.messages}
                currentUserId={currentUser.id}
                channelName={channel.name}
                isDarkMode={isDarkMode}
                onViewProfile={(user) => {
                    console.log('View profile:', user);
                }}
                onVote={(pollId, optionId) => {
                    console.log('Vote:', pollId, optionId);
                }}
                onViewResults={(poll) => {
                    console.log('View results:', poll);
                }}
                onReaction={handleEmojiReaction}
                onReply={handleReply}
                isChannel={true}
            />

            {/* Input */}
            <div className={`border-t p-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                {/* Reply Preview Section */}
                {replyingTo && (
                    <ReplyPreview
                        replyTo={replyingTo}
                        onCancel={handleCancelReply}
                        isDarkMode={isDarkMode}
                    />
                )}

                <div className="flex gap-2">
                    <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Nhắn tin đến #${channel.name}...`}
                        className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                    <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}