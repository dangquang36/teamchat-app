'use client';

import { MessageItem, Message, UserProfile } from './MessageItem';
import { Poll } from '@/components/chat/1-n/poll/PollMessage';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    channelName: string;
    isDarkMode: boolean;
    onViewProfile: (user: UserProfile) => void;
    onVote: (pollId: string, optionId: string) => void;
    onViewResults: (poll: Poll) => void;
}

export function MessageList({
    messages,
    currentUserId,
    channelName,
    isDarkMode,
    onViewProfile,
    onVote,
    onViewResults,
}: MessageListProps) {
    return (
        <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
            } scrollbar-hide`}>
            {messages.length === 0 ? (
                <p className="text-center text-gray-500">
                    Đây là khởi đầu của kênh #{channelName}.
                </p>
            ) : (
                messages.map((message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        currentUserId={currentUserId}
                        isDarkMode={isDarkMode}
                        onViewProfile={onViewProfile}
                        onVote={onVote}
                        onViewResults={onViewResults}
                    />
                ))
            )}
        </div>
    );
}