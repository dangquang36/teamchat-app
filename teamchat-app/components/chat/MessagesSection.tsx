import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { ChatItem } from './ChatItem';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserProfileModal } from '@/components/modals/UserProfileModalChat';
import type { UserProfile, DirectMessage, Message, Poll } from '@/app/types';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-lg p-1 flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="text-xl p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    isDarkMode?: boolean;
}

// Định nghĩa interface cho ChatMessages component để tương thích
interface ChatMessagesUserProfile {
    id: string;
    name: string;
    avatar: string;
    email: string;
    online: boolean;
}

interface ChatMessagesMessage {
    id: string;
    from: string;
    text?: string;
    time: string;
    reactions: Array<{ emoji: string; user: string }>;
    type?: 'text';
}

export function MessagesSection({
    onVideoCall,
    onAudioCall,
    isDarkMode = false,
}: MessagesSectionProps) {
    const [selectedChatId, setSelectedChatId] = useState<string>('nicholas');
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
            setCurrentDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        setCurrentDarkMode(isDarkMode);
    }, [isDarkMode]);

    const handleMessageFromProfile = (userId: string) => {
        setSelectedChatId(userId);
        setViewingProfile(null);
    };

    const handleCallFromProfile = (user: UserProfile) => {
        setViewingProfile(null);
        onAudioCall();
    };

    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
        {
            id: 'nicholas',
            name: 'Nicholas Staten',
            email: 'nicholas.staten@example.com',
            message: 'Pleased to meet you again!',
            avatar: '/placeholder.svg?height=40&width=40&text=NS',
            online: true,
            coverPhotoUrl: '/placeholder-cover.jpg',
            phone: '123-456-7890',
            birthday: '1990-01-01',
            socialProfiles: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
            },
            mutualGroups: 2,
        },
        {
            id: 'victoria',
            name: 'Victoria Lane',
            email: 'victoria.lane@example.com',
            message: "Hey, I'm going to meet a friend...",
            avatar: '/placeholder.svg?height=40&width=40&text=VL',
            online: true,
            coverPhotoUrl: '/placeholder-cover.jpg',
            phone: '098-765-4321',
            birthday: '1992-02-02',
            socialProfiles: {
                facebook: '',
                twitter: '',
                instagram: '',
                linkedin: '',
            },
            mutualGroups: 1,
        },
    ]);

    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});

    const selectedChatUser = directMessages.find((dm) => dm.id === selectedChatId);
    const filteredDirectMessages = directMessages.filter(
        (dm) =>
            dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dm.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const currentMessages = allMessages[selectedChatId] || [];

    const handleAddDirectMessage = () => {
        const name = prompt('Nhập tên người bạn muốn nhắn tin:');
        const email = prompt('Nhập email của người bạn muốn nhắn tin:');
        if (name && email) {
            const newId = name.toLowerCase().replace(/\s/g, '');
            const newUser: DirectMessage = {
                id: newId,
                name,
                email,
                message: 'Bắt đầu cuộc trò chuyện...',
                avatar: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
                online: false,
                coverPhotoUrl: '/placeholder-cover.jpg',
                phone: '',
                birthday: '',
                socialProfiles: {
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: '',
                },
                mutualGroups: 0,
            };
            setDirectMessages((prev) => [...prev, newUser]);
            setAllMessages((prev) => ({ ...prev, [newId]: [] }));
            setSelectedChatId(newId);
        }
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim() || !selectedChatId) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            from: 'me',
            text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            reactions: [],
            type: 'text',
        };

        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));

        setTimeout(() => {
            const replyMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                from: selectedChatId,
                text: 'Ok, noted!',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                reactions: [],
                type: 'text',
            };
            setAllMessages((prev) => ({
                ...prev,
                [selectedChatId]: [...(prev[selectedChatId] || []), replyMessage],
            }));
        }, 1000);
    };

    const handleCreatePoll = (pollData: { question: string; options: string[] }) => {
        if (!selectedChatId || !pollData.question.trim() || pollData.options.length < 2) return;

        const pollId = `poll-${Date.now()}`;
        const newPoll: Poll = {
            id: pollId,
            question: pollData.question,
            options: pollData.options.map((opt) => ({
                text: opt,
                votes: 0,
                voters: [],
            })),
            totalVotes: 0,
            allowMultipleVotes: false,
            createdBy: 'me',
            createdAt: new Date().toISOString(),
            voters: []
        };

        const newPollMessage: Message = {
            id: `msg-${Date.now()}`,
            from: 'me',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: 'poll',
            poll: newPoll,
            reactions: [],
        };

        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newPollMessage],
        }));
    };

    const handleVote = (messageId: string, optionIndex: number) => {
        if (!selectedChatId) return;

        setAllMessages((prev) => {
            const currentMessages = prev[selectedChatId] || [];
            const updatedMessages = currentMessages.map((msg) => {
                if (msg.id === messageId && msg.type === 'poll' && msg.poll) {
                    const currentUserId = 'me';
                    const poll = { ...msg.poll };
                    const option = poll.options[optionIndex];

                    const hasVoted = option.voters.includes(currentUserId);

                    if (hasVoted) {
                        option.voters = option.voters.filter((id) => id !== currentUserId);
                        option.votes = Math.max(0, option.votes - 1);
                    } else {
                        if (!poll.allowMultipleVotes) {
                            poll.options.forEach((opt, idx) => {
                                if (idx !== optionIndex && opt.voters.includes(currentUserId)) {
                                    opt.voters = opt.voters.filter((id) => id !== currentUserId);
                                    opt.votes = Math.max(0, opt.votes - 1);
                                }
                            });
                        }

                        option.voters.push(currentUserId);
                        option.votes += 1;
                    }

                    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

                    return {
                        ...msg,
                        poll,
                    };
                }
                return msg;
            });

            return { ...prev, [selectedChatId]: updatedMessages };
        });
    };

    const handleToggleReaction = (messageId: string, emoji: string) => {
        if (!selectedChatId) return;

        setAllMessages((prev) => {
            const chatMessages = prev[selectedChatId];
            const updatedMessages = chatMessages.map((message) => {
                if (message.id === messageId) {
                    const existingReactions = message.reactions || [];
                    const myReactionIndex = existingReactions.findIndex(
                        (r) => r.emoji === emoji && r.user === 'me'
                    );

                    let newReactions;

                    if (myReactionIndex > -1) {
                        newReactions = existingReactions.filter((_, index) => index !== myReactionIndex);
                    } else {
                        newReactions = [...existingReactions, { emoji, user: 'me' }];
                    }

                    return { ...message, reactions: newReactions };
                }
                return message;
            });

            return {
                ...prev,
                [selectedChatId]: updatedMessages,
            };
        });
    };

    // Chuyển đổi messages để tương thích với ChatMessages component
    const convertedMessages: ChatMessagesMessage[] = currentMessages
        .filter((msg) => msg.type === 'text') // Chỉ hiển thị text messages
        .map((msg) => ({
            id: msg.id,
            from: msg.from,
            text: msg.text,
            time: msg.time,
            reactions: msg.reactions,
            type: 'text' as const,
        }));

    // User profile tương thích với ChatMessages component
    const convertedCurrentUser: ChatMessagesUserProfile = {
        id: 'me',
        name: 'Current User',
        avatar: '/placeholder.svg?height=32&width=32&text=CU',
        email: 'current.user@example.com',
        online: true,
    };

    return (
        <>
            <div
                className={`w-80 border-r ${currentDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className={`text-lg font-semibold flex items-center gap-2 ${currentDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                        >
                            Tin Nhắn
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng hoặc email..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${currentDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3
                                className={`text-xs font-semibold uppercase tracking-wider ${currentDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}
                            >
                                TIN NHẮN TRỰC TIẾP
                            </h3>
                        </div>
                        <div className="space-y-1">
                            {filteredDirectMessages.map((dm) => (
                                <ChatItem
                                    key={dm.id}
                                    name={dm.name}
                                    message={dm.message}
                                    avatar={dm.avatar}
                                    active={selectedChatId === dm.id}
                                    isDarkMode={currentDarkMode}
                                    onClick={() => setSelectedChatId(dm.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                {selectedChatUser ? (
                    <>
                        <ChatHeader
                            user={selectedChatUser}
                            onVideoCall={onVideoCall}
                            onAudioCall={onAudioCall}
                            isDarkMode={currentDarkMode}
                            onViewProfile={() => setViewingProfile(selectedChatUser)}
                        />
                        <ChatMessages
                            messages={convertedMessages}
                            currentUser={convertedCurrentUser}
                            isDarkMode={currentDarkMode}
                        />
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            onCreatePoll={handleCreatePoll}
                            isDarkMode={currentDarkMode}
                        />

                        {/* Hiển thị polls riêng biệt nếu cần */}
                        <div className="p-4 border-t">
                            {currentMessages
                                .filter((msg) => msg.type === 'poll')
                                .map((msg) => (
                                    <div key={msg.id} className="mb-4 p-3 border rounded-lg">
                                        <h4 className="font-semibold mb-2">{msg.poll?.question}</h4>
                                        <div className="space-y-2">
                                            {msg.poll?.options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleVote(msg.id, idx)}
                                                    className="w-full text-left p-2 border rounded hover:bg-gray-100 flex justify-between"
                                                >
                                                    <span>{option.text}</span>
                                                    <span className="text-gray-500">({option.votes})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </>
                ) : (
                    <div
                        className={`flex-1 flex items-center justify-center ${currentDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                    >
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>
            {viewingProfile && (
                <UserProfileModal
                    user={viewingProfile}
                    onClose={() => setViewingProfile(null)}
                    onSendMessage={handleMessageFromProfile}
                    onStartCall={handleCallFromProfile}
                    isDarkMode={currentDarkMode}
                />
            )}
        </>
    );
}