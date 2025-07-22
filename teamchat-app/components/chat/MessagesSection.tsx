import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { ChatItem } from './ChatItem';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserProfileModal } from '@/components/modals/UserProfileModalChat';
import type { UserProfile, DirectMessage, Message, Poll } from '@/app/types';
import { ConversationDetails } from '@/components/modals/ConversationDetails';

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

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white z-50 animate-slide-in`}>
            <div className="flex justify-between items-center">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">×</button>
            </div>
        </div>
    );
};

interface ConfirmDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contactName: string;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ isOpen, onClose, onConfirm, contactName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 text-white w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Xác nhận xóa liên lạc</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <p className="mb-6">Bạn có chắc chắn muốn xóa liên lạc "{contactName}" không? Hành động này không thể hoàn tác.</p>
                <div className="flex justify-end gap-4">
                    <Button
                        onClick={onClose}
                        className="bg-gray-600 text-white hover:bg-gray-500 px-4 py-2 rounded"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-500 px-4 py-2 rounded"
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    isDarkMode?: boolean;
}





export function MessagesSection({
    onVideoCall,
    onAudioCall,
    isDarkMode = false,
}: MessagesSectionProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string>('nicholas');
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContactName, setNewContactName] = useState('');
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
            setCurrentDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        setCurrentDarkMode(isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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

    const currentUser = {
        id: 'me', name: 'Current User', avatar: '/placeholder.svg?height=32&width=32&text=CU',
        email: 'current.user@example.com', online: true
    };
    const handleAddDirectMessage = () => {
        if (!newContactName.trim()) {
            setNotification({ message: 'Thêm liên lạc thất bại: Vui lòng nhập tên', type: 'error' });
            return;
        }

        if (directMessages.some(dm => dm.name.toLowerCase() === newContactName.toLowerCase())) {
            setNotification({ message: 'Thêm liên lạc thất bại: Tên đã tồn tại', type: 'error' });
            return;
        }

        const newId = newContactName.toLowerCase().replace(/\s/g, '');
        const email = `${newContactName.toLowerCase().replace(/\s/g, '.')}.example.com`;
        const newUser: DirectMessage = {
            id: newId,
            name: newContactName.trim(),
            email: email,
            message: 'Bắt đầu cuộc trò chuyện...',
            avatar: `/placeholder.svg?height=40&width=40&text=${newContactName.charAt(0)}`,
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
        setNotification({ message: `Đã thêm ${newContactName} vào danh sách liên lạc`, type: 'success' });
        setShowAddForm(false);
        setNewContactName('');
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

    const handleDeleteContact = (contactId: string) => {
        const contact = directMessages.find((dm) => dm.id === contactId);
        if (contact) {
            setContactToDelete(contactId);
            setShowConfirmDelete(true);
        }
    };

    const confirmDeleteContact = () => {
        if (contactToDelete) {
            setDirectMessages((prev) => prev.filter((dm) => dm.id !== contactToDelete));
            if (selectedChatId === contactToDelete) {
                setSelectedChatId('');
                setAllMessages((prev) => {
                    const { [contactToDelete]: _, ...rest } = prev;
                    return rest;
                });
            }
            setNotification({ message: 'Đã xóa liên lạc thành công', type: 'success' });
            setShowConfirmDelete(false);
            setContactToDelete(null);
        }
    };



    return (
        <>
            <div className="flex h-screen w-full bg-white dark:bg-gray-900">
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowAddForm(true)}
                                    title="Thêm liên lạc mới"
                                    className={currentDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            {showAddForm && (
                                <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                                    <p className="text-sm text-gray-300 mb-2">Nhập tên để thêm người liên lạc: </p>
                                    <input
                                        type="text"
                                        value={newContactName}
                                        onChange={(e) => setNewContactName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newContactName.trim()) {
                                                handleAddDirectMessage();
                                            }
                                        }}
                                        className="w-full p-2 mb-2 border rounded-lg bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Tên"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setNewContactName('');
                                            }}
                                            className="bg-purple-700 text-white hover:bg-purple-600 px-4 py-2 rounded-lg"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={handleAddDirectMessage}
                                            className="bg-purple-400 text-white hover:bg-purple-300 px-4 py-2 rounded-lg"
                                        >
                                            OK
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                {filteredDirectMessages.map((dm) => (
                                    <div key={dm.id} className="relative group">
                                        <ChatItem
                                            name={dm.name}
                                            message={dm.message}
                                            avatar={dm.avatar}
                                            active={selectedChatId === dm.id}
                                            isDarkMode={currentDarkMode}
                                            onClick={() => setSelectedChatId(dm.id)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteContact(dm.id)}
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${currentDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                            title="Xóa liên lạc"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
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
                                onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
                            />
                            <ChatMessages
                                messages={currentMessages}
                                currentUser={currentUser}
                                isDarkMode={currentDarkMode}
                                onVote={handleVote}
                                onToggleReaction={handleToggleReaction}
                            />
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                onCreatePoll={handleCreatePoll}
                                isDarkMode={currentDarkMode}
                            />


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
                {isDetailsOpen && selectedChatUser && (
                    <ConversationDetails
                        user={selectedChatUser}
                        onClose={() => setIsDetailsOpen(false)}
                        isDarkMode={currentDarkMode}
                    />
                )}

                {viewingProfile && (
                    <UserProfileModal
                        user={viewingProfile}
                        onClose={() => setViewingProfile(null)}
                        onSendMessage={handleMessageFromProfile}
                        onStartCall={handleCallFromProfile}
                        isDarkMode={currentDarkMode}
                    />
                )}
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
                {showConfirmDelete && contactToDelete && (
                    <ConfirmDelete
                        isOpen={showConfirmDelete}
                        onClose={() => setShowConfirmDelete(false)}
                        onConfirm={confirmDeleteContact}
                        contactName={directMessages.find((dm) => dm.id === contactToDelete)?.name || ''}
                    />
                )}
            </div >
        </>
    );
}