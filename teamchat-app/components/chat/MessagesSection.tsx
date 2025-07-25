"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatItem } from './ChatItem';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserProfileModal } from '@/components/modals/UserProfileModalChat';
import { ConversationDetails } from '@/components/modals/Awuamen/ConversationDetails';
import { AddContactModal } from '@/components/modals/AddContactModal';
import { CustomToast } from '@/components/modals/Awuamen/CustomToast';
import { MuteBanner } from '@/components/modals/Awuamen/MuteBanner';
import { MuteNotificationsModal } from '@/components/modals/Awuamen/MuteNotificationsModal';
import { Notification } from '@/components/ui/Notification';
import { ConfirmDelete } from '@/components/ui/ConfirmDeleteDialog';
import { ArchiveView } from '@/components/modals/Awuamen/ArchiveView';
import type { UserProfile } from '@/app/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FriendRequestList } from '@/components/modals/FriendRequestList';
import { FriendRequestSheet } from '@/components/modals/FriendRequestSheet';
import { useChatContext } from '@/contexts/ChatContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    isDarkMode?: boolean;
}

const formatMutedUntil = (date?: Date) => {
    if (!date) return 'vô thời hạn';
    if (date.getFullYear() > new Date().getFullYear() + 50) return 'khi được mở lại';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export function MessagesSection({ onVideoCall, onAudioCall, isDarkMode = false }: MessagesSectionProps) {
    const {
        filteredDirectMessages, selectedChatId, setSelectedChatId, searchQuery,
        setSearchQuery, isAddContactModalOpen, setIsAddContactModalOpen,
        handleDeleteContact, showConfirmDelete, setShowConfirmDelete, confirmDeleteContact,
        contactToDelete, directMessages, notification, setNotification, selectedChatUser,
        currentMessages, isDetailsOpen, setIsDetailsOpen, viewingProfile, setViewingProfile,
        currentMuteInfo, handleToggleMute, isMuteModalOpen, setIsMuteModalOpen,
        handleConfirmMute, handleSendMessage, refreshContacts, toast, showToast, unreadChats,
    } = useChatContext();

    const currentUser = useCurrentUser();

    const [rightPanelView, setRightPanelView] = useState<'details' | 'archive' | 'closed'>('closed');
    const [archiveInitialTab, setArchiveInitialTab] = useState<'media' | 'files'>('media');
    const [isFriendRequestSheetOpen, setIsFriendRequestSheetOpen] = useState(false);

    if (!currentUser) {
        return <div className="flex-1 flex items-center justify-center">Đang tải dữ liệu người dùng...</div>;
    }

    const handleFriendRequestAccepted = () => {
        console.log("Friend request accepted! Refreshing contacts...");
        refreshContacts();
    };

    const handleToggleDetails = () => {
        setRightPanelView(prev => (prev === 'closed' ? 'details' : 'closed'));
    };

    const handleViewAllMedia = () => {
        setArchiveInitialTab('media');
        setRightPanelView('archive');
    };

    const handleViewAllFiles = () => {
        setArchiveInitialTab('files');
        setRightPanelView('archive');
    };

    const handleCloseArchive = () => {
        setRightPanelView('details');
    };

    const allAttachments = currentMessages.flatMap(msg =>
        (msg.attachments || []).map(attachment => ({
            ...attachment,
            createdAt: msg.time,
        }))
    );
    const mediaFiles = allAttachments.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const otherFiles = allAttachments.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));

    const handleMessageFromProfile = (userId: string) => {
        setSelectedChatId(userId);
        setViewingProfile(null);
    };

    const handleCallFromProfile = (user: UserProfile) => {
        setViewingProfile(null);
        onAudioCall();
    };

    return (
        <>
            <div className="flex h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
                {/* Phần danh sách chat bên trái */}
                <div className={`w-80 border-r transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Tin Nhắn
                            </h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng hoặc email..."
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300 ${isDarkMode
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
                                <h3 className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    TIN NHẮN TRỰC TIẾP
                                </h3>
                                <div className="flex items-center space-x-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 rounded-full transition-all duration-300 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                                title="Lời mời kết bạn"
                                                onClick={() => setIsFriendRequestSheetOpen(true)}
                                            >
                                                <Bell className="h-5 w-5" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className={`w-80 p-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} align="end">
                                            <FriendRequestList
                                                onFriendRequestAccepted={handleFriendRequestAccepted}
                                                onShowToast={showToast}
                                                isDarkMode={isDarkMode}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsAddContactModalOpen(true)}
                                        title="Thêm liên lạc mới"
                                        className={`h-8 w-8 rounded-full transition-all duration-300 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <AnimatePresence>
                                    {filteredDirectMessages.map((dm) => (
                                        <motion.div
                                            key={dm.id}
                                            layout
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="relative group"
                                        >
                                            <div className="relative group">
                                                <ChatItem
                                                    name={dm.name}
                                                    message={dm.message}
                                                    avatar={dm.avatar}
                                                    active={selectedChatUser?.id === dm.id}
                                                    isDarkMode={isDarkMode}
                                                    onClick={() => setSelectedChatId(dm.id)}
                                                    unreadCount={unreadChats[dm.id] || 0}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteContact(dm.id)}
                                                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                                    title="Xóa liên lạc"
                                                >
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần khung chat chính */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedChatUser ? (
                        <>
                            <ChatHeader
                                user={selectedChatUser}
                                onAudioCall={onAudioCall}
                                isDarkMode={isDarkMode}
                                onViewProfile={() => setViewingProfile(selectedChatUser)}
                                onToggleDetails={handleToggleDetails}
                                isDetailsOpen={rightPanelView !== 'closed'}
                            />
                            <AnimatePresence>
                                {currentMuteInfo.isMuted && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MuteBanner
                                            mutedUntil={formatMutedUntil(currentMuteInfo.mutedUntil)}
                                            onUnmute={handleToggleMute}
                                            isDarkMode={isDarkMode}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <ChatMessages
                                messages={currentMessages}
                                currentUser={currentUser}
                                otherUser={selectedChatUser}
                                isDarkMode={isDarkMode}
                                setViewingProfile={setViewingProfile}
                            />
                            <ChatInput
                                onSendMessage={handleSendMessage}
                                isDarkMode={isDarkMode}
                            />
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`flex-1 flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Phần chi tiết cuộc trò chuyện */}
                <AnimatePresence>
                    {selectedChatUser && rightPanelView === 'details' && (
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <ConversationDetails
                                user={selectedChatUser}
                                messages={currentMessages}
                                onClose={() => setRightPanelView('closed')}
                                isDarkMode={isDarkMode}
                                isMuted={currentMuteInfo.isMuted}
                                onToggleMute={handleToggleMute}
                                onViewAllMedia={handleViewAllMedia}
                                onViewAllFiles={handleViewAllFiles}
                            />
                        </motion.div>
                    )}
                    {selectedChatUser && rightPanelView === 'archive' && (
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <ArchiveView
                                initialTab={archiveInitialTab}
                                mediaFiles={mediaFiles}
                                otherFiles={otherFiles}
                                onClose={handleCloseArchive}
                                isDarkMode={isDarkMode}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Các modal được quản lý ở đây */}
            <AnimatePresence>
                {viewingProfile && (
                    <UserProfileModal
                        user={viewingProfile}
                        onClose={() => setViewingProfile(null)}
                        onSendMessage={handleMessageFromProfile}
                        onStartCall={() => handleCallFromProfile(viewingProfile)}
                        isDarkMode={isDarkMode}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showConfirmDelete && contactToDelete && (
                    <ConfirmDelete
                        isOpen={showConfirmDelete}
                        onClose={() => setShowConfirmDelete(false)}
                        onConfirm={confirmDeleteContact}
                        contactName={directMessages.find((dm) => dm.id === contactToDelete)?.name || ''}
                    />
                )}
            </AnimatePresence>

            <FriendRequestSheet
                isOpen={isFriendRequestSheetOpen}
                onClose={() => setIsFriendRequestSheetOpen(false)}
                onFriendRequestAccepted={handleFriendRequestAccepted}
                onShowToast={showToast}
                isDarkMode={isDarkMode}
            />

            <AddContactModal
                isOpen={isAddContactModalOpen}
                onClose={() => setIsAddContactModalOpen(false)}
                existingContacts={directMessages}
                isDarkMode={isDarkMode}
                onShowToast={showToast}
            />

            <MuteNotificationsModal
                isOpen={isMuteModalOpen}
                onClose={() => setIsMuteModalOpen(false)}
                onConfirm={handleConfirmMute}
                isDarkMode={isDarkMode}
            />

            <AnimatePresence>
                {toast.show && (
                    <CustomToast message={toast.message} show={toast.show} />
                )}
            </AnimatePresence>
        </>
    );
}