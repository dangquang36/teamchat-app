'use client';

import { MessageItem, Message, UserProfile } from './MessageItem';
import { ChannelMessageItem, ChannelMessage } from '../channel/ChannelMessageItem';
import { Poll } from '@/components/chat/poll/PollMessage';

interface MessageListProps {
    messages: Message[] | ChannelMessage[];
    currentUserId: string;
    channelName: string;
    isDarkMode: boolean;
    onViewProfile: (user: UserProfile) => void;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
    onReaction?: (messageId: string, emoji: string) => void;
    onReply?: (message: Message | ChannelMessage) => void;
    isChannel?: boolean;
}

export function MessageList({
    messages,
    currentUserId,
    channelName,
    isDarkMode,
    onViewProfile,
    onVote,
    onViewResults,
    onReaction,
    onReply,
    isChannel = false,
}: MessageListProps) {
    return (
        <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
            } scrollbar-hide`}>
            {messages.length === 0 ? (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Đây là khởi đầu của kênh #{channelName}.
                </p>
            ) : (
                messages.map((message) => {
                    if (isChannel) {
                        return (
                            <ChannelMessageItem
                                key={message.id}
                                message={message as ChannelMessage}
                                currentUserId={currentUserId}
                                isDarkMode={isDarkMode}
                                onViewProfile={onViewProfile}
                                onVote={onVote}
                                onViewResults={onViewResults}
                                onReaction={onReaction}
                                onReply={onReply}
                            />
                        );
                    } else {
                        return (
                            <MessageItem
                                key={message.id}
                                message={message as Message}
                                currentUserId={currentUserId}
                                isDarkMode={isDarkMode}
                                onViewProfile={onViewProfile}
                                onVote={onVote}
                                onViewResults={onViewResults}
                                onReaction={onReaction}
                                onReply={onReply}
                            />
                        );
                    }
                })
            )}
        </div>
    );
}