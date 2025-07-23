import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { ChatItem } from './ChatItem';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserProfileModal } from '@/components/modals/UserProfileModalChat';
import { ConversationDetails } from '@/components/modals/TB/ConversationDetails';
import { AddContactModal } from '@/components/modals/AddContactModal';
import type { UserProfile, DirectMessage, Message, Poll } from '@/app/types';
import { AnimatePresence } from 'framer-motion';
import { CustomToast } from '@/components/modals/TB/CustomToast';
import { MuteBanner } from '@/components/modals/TB/MuteBanner';
import { MuteNotificationsModal } from '@/components/modals/TB/MuteNotificationsModal';


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

interface MuteInfo {
    isMuted: boolean;
    mutedUntil?: Date;
}


export function MessagesSection({
    onVideoCall,
    onAudioCall,
    isDarkMode = false,
}: MessagesSectionProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string>('nicholas');
    const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
    const [muteStatus, setMuteStatus] = useState<Record<string, MuteInfo>>({});
    const [toast, setToast] = useState({ show: false, message: '' });
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);


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

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 3000);
    };

    const handleToggleMute = () => {
        const currentMuteInfo = muteStatus[selectedChatId ?? ''] || { isMuted: false };
        if (currentMuteInfo.isMuted) {
            setMuteStatus(prev => ({ ...prev, [selectedChatId!]: { isMuted: false, mutedUntil: undefined } }));
            showToast('Đã bật lại thông báo');
        } else {
            setIsMuteModalOpen(true);
        }
    };

    const handleConfirmMute = (duration: string) => {
        const now = new Date();
        let mutedUntil = new Date();
        if (duration === '1_hour') {
            mutedUntil.setHours(now.getHours() + 1);
        } else if (duration === '4_hours') {
            mutedUntil.setHours(now.getHours() + 4);
        } else if (duration === 'until_8_am') {
            mutedUntil.setHours(8, 0, 0, 0);
            if (mutedUntil < now) {
                mutedUntil.setDate(now.getDate() + 1);
            }
        } else {
            mutedUntil = new Date(now.getFullYear() + 100, 0, 1);
        }

        setMuteStatus(prev => ({ ...prev, [selectedChatId!]: { isMuted: true, mutedUntil } }));
        setIsMuteModalOpen(false);
        showToast('Đã tắt thông báo');
    };

    const currentMuteInfo = selectedChatId ? (muteStatus[selectedChatId] || { isMuted: false }) : { isMuted: false };

    const formatMutedUntil = (date?: Date) => {
        if (!date) return 'vô thời hạn';
        if (date.getFullYear() > new Date().getFullYear() + 50) return 'khi được mở lại';
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

    const handleMessageFromProfile = (userId: string) => {
        setSelectedChatId(userId);
        setViewingProfile(null);
    };

    const handleCallFromProfile = (user: UserProfile) => {
        setViewingProfile(null);
        onAudioCall();
    };



    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});

    const filteredDirectMessages = directMessages.filter(
        (dm) =>
            dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dm.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const selectedChatUser = directMessages.find((dm) => dm.id === selectedChatId);
    const currentUser = {
        id: 'me', name: 'Current User', avatar: '/placeholder.svg?height=32&width=32&text=CU',
        email: 'current.user@example.com', online: true
    };
    const currentMessages = allMessages[selectedChatId] || [];

    const handleAddContact = (user: Omit<DirectMessage, 'message'>) => {
        const newContact: DirectMessage = {
            ...user,
            message: 'Bắt đầu cuộc trò chuyện...',
        };

        setDirectMessages((prev) => [...prev, newContact]);
        setAllMessages((prev) => ({ ...prev, [newContact.id]: [] }));
        setSelectedChatId(newContact.id);
        setNotification({ message: `Đã thêm ${newContact.name} vào danh bạ!`, type: 'success' });
        setIsAddContactModalOpen(false); // Đóng modal sau khi thêm thành công
    };

    // --- XÓA ---
    // Hàm handleAddDirectMessage cũ đã được xóa bỏ.

    const handleSendMessage = (text: string) => {
        if (!text.trim() || !selectedChatId) return;
        const newMessage: Message = {
            id: `msg-${Date.now()}`, from: 'me', text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            reactions: [], type: 'text',
        };
        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));
        setTimeout(() => {
            const replyMessage: Message = {
                id: `msg-${Date.now() + 1}`, from: selectedChatId, text: 'Ok, noted!',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                reactions: [], type: 'text',
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
            id: pollId, question: pollData.question,
            options: pollData.options.map((opt) => ({ text: opt, votes: 0, voters: [], })),
            totalVotes: 0, allowMultipleVotes: false, createdBy: 'me', createdAt: new Date().toISOString(), voters: []
        };
        const newPollMessage: Message = {
            id: `msg-${Date.now()}`, from: 'me',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            type: 'poll', poll: newPoll, reactions: [],
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
                    return { ...msg, poll, };
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
                    const myReactionIndex = existingReactions.findIndex((r) => r.emoji === emoji && r.user === 'me');
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
            return { ...prev, [selectedChatId]: updatedMessages, };
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
            <div className="flex h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
                <div className={`w-80 border-r ${currentDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-semibold flex items-center gap-2 ${currentDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                                <h3 className={`text-xs font-semibold uppercase tracking-wider ${currentDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    TIN NHẮN TRỰC TIẾP
                                </h3>
                                {/* --- SỬA ĐỔI --- */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsAddContactModalOpen(true)} // Mở modal khi click
                                    title="Thêm liên lạc mới"
                                    className={currentDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* --- XÓA --- */}
                            {/* Toàn bộ khối `showAddForm` đã được xóa bỏ */}

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
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedChatUser ? (
                        <>


                            <ChatHeader
                                user={selectedChatUser}
                                onAudioCall={onAudioCall}
                                isDarkMode={currentDarkMode}
                                onViewProfile={() => setViewingProfile(selectedChatUser)}
                                onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
                                isDetailsOpen={isDetailsOpen}
                            />

                            <AnimatePresence>
                                {currentMuteInfo.isMuted && (
                                    <MuteBanner
                                        mutedUntil={formatMutedUntil(currentMuteInfo.mutedUntil)}
                                        onUnmute={handleToggleMute}
                                        isDarkMode={currentDarkMode}
                                    />
                                )}
                            </AnimatePresence>

                            <ChatMessages
                                messages={currentMessages}
                                currentUser={currentUser}
                                otherUser={selectedChatUser}
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
                        <div className={`flex-1 flex items-center justify-center ${currentDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Chọn một cuộc trò chuyện để bắt đầu
                        </div>
                    )}
                </div>
                <AnimatePresence>
                    {isDetailsOpen && selectedChatUser && (
                        <ConversationDetails
                            user={selectedChatUser}
                            onClose={() => setIsDetailsOpen(false)}
                            isDarkMode={currentDarkMode}
                            isMuted={currentMuteInfo.isMuted}
                            onToggleMute={handleToggleMute}
                        />
                    )}
                </AnimatePresence>

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
                <AddContactModal
                    isOpen={isAddContactModalOpen}
                    onClose={() => setIsAddContactModalOpen(false)}
                    onAddContact={handleAddContact}
                    existingContacts={directMessages}
                    isDarkMode={currentDarkMode}
                />
            </div>
            <CustomToast message={toast.message} show={toast.show} />
            <MuteNotificationsModal
                isOpen={isMuteModalOpen}
                onClose={() => setIsMuteModalOpen(false)}
                onConfirm={handleConfirmMute}
                isDarkMode={currentDarkMode}
            />
        </>
    );
}