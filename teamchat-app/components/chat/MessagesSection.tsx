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
import { useSocket } from '@/contexts/SocketContext';
import { PinNotification } from '@/components/modals/Awuamen/PinNotification';
import { usePinnedChats } from '@/hooks/usePinnedChats';

interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    isDarkMode?: boolean;
}

const formatMutedUntil = (date?: Date): string => {
    if (!date) return 'vô thời hạn';
    if (date.getFullYear() > new Date().getFullYear() + 50) return 'khi được mở lại';
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export function MessagesSection({ onVideoCall, onAudioCall, isDarkMode = false }: MessagesSectionProps) {
    const {
        filteredDirectMessages,
        selectedChatId,
        setSelectedChatId,
        searchQuery,
        setSearchQuery,
        isAddContactModalOpen,
        setIsAddContactModalOpen,
        handleDeleteContact,
        showConfirmDelete,
        setShowConfirmDelete,
        confirmDeleteContact,
        contactToDelete,
        directMessages,
        notification,
        setNotification,
        selectedChatUser,
        currentMessages,
        isDetailsOpen,
        setIsDetailsOpen,
        viewingProfile,
        setViewingProfile,
        currentMuteInfo,
        handleToggleMute,
        isMuteModalOpen,
        setIsMuteModalOpen,
        handleConfirmMute,
        handleSendMessage,
        refreshContacts,
        toast,
        showToast,
        unreadChats,
    } = useChatContext();

    const { isPinned, togglePin, sortChatsWithPinned } = usePinnedChats();

    const [pinNotification, setPinNotification] = useState<{
        show: boolean;
        isPinned: boolean;
        userName: string;
    }>({
        show: false,
        isPinned: false,
        userName: ''
    });

    const handleTogglePin = () => {
        if (!selectedChatUser) return;

        const wasPinned = isPinned(selectedChatUser.id);
        togglePin(selectedChatUser.id);

        // Hiển thị thông báo
        setPinNotification({
            show: true,
            isPinned: !wasPinned,
            userName: selectedChatUser.name
        });

        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
            setPinNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const sortedDirectMessages = sortChatsWithPinned(filteredDirectMessages);

    const currentUser = useCurrentUser();

    // Access call functions từ SocketContext
    const { initiateCall, callStatus, isInCall } = useSocket();

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
        if (selectedChatUser) {
            handleVideoCall();
        }
    };

    // Handle video call - tích hợp với LiveKit system
    const handleVideoCall = () => {
        if (!selectedChatUser || callStatus !== 'idle') {
            console.log('Cannot initiate call:', { selectedChatUser, callStatus });
            return;
        }

        console.log('Initiating video call to:', selectedChatUser.name, selectedChatUser.id);

        // Call function từ useSocket hook
        initiateCall(selectedChatUser.id, selectedChatUser.name);
    };

    // Handle audio call - có thể dùng chung logic hoặc tách riêng
    const handleAudioCall = () => {
        if (!selectedChatUser || callStatus !== 'idle') {
            console.log('Cannot initiate audio call:', { selectedChatUser, callStatus });
            return;
        }

        console.log('Initiating audio call to:', selectedChatUser.name, selectedChatUser.id);

        // Tạm thời dùng chung logic với video call
        // Sau này có thể tách riêng cho audio-only call
        initiateCall(selectedChatUser.id, selectedChatUser.name);
    };

    return (
        <>
            <div className="flex h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
                {/* Phần danh sách chat bên trái */}
                <div className={`w-80 border-r transition-colors duration-300 flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Tin Nhắn
                                {/* Call status indicator */}
                                {isInCall && (
                                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
                                        Đang gọi
                                    </span>
                                )}
                                {callStatus !== 'idle' && !isInCall && (
                                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                                        {callStatus === 'calling' ? 'Đang gọi...' :
                                            callStatus === 'ringing' ? 'Có cuộc gọi đến' :
                                                callStatus}
                                    </span>
                                )}
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
                                    {sortedDirectMessages.map((dm) => (
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
                                                    isPinned={isPinned(dm.id)}
                                                />

                                                {/* Nút xóa - chỉ hiển thị khi hover */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteContact(dm.id);
                                                    }}
                                                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-700/80 hover:bg-red-500/80 text-white"
                                                    title="Xóa liên lạc"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần khung chat chính - điều chỉnh width dựa trên rightPanelView */}
                <motion.div
                    className="flex flex-col min-w-0 transition-all duration-300"
                    animate={{
                        width: rightPanelView !== 'closed'
                            ? 'calc(100% - 320px - 320px)'
                            : 'calc(100% - 320px)'
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    {selectedChatUser ? (
                        <>
                            <ChatHeader
                                user={selectedChatUser}
                                onAudioCall={handleAudioCall}
                                onVideoCall={handleVideoCall}
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

                            {/* Call status banner */}
                            {(isInCall || callStatus !== 'idle') && (
                                <div className={`p-3 text-center border-b ${isDarkMode ? 'bg-blue-900 border-gray-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'
                                    }`}>
                                    {isInCall ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            Đang trong cuộc gọi video với {selectedChatUser.name}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            {callStatus === 'calling' && (
                                                <>
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                                    Đang gọi {selectedChatUser.name}...
                                                </>
                                            )}
                                            {callStatus === 'ringing' && (
                                                <>
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    {selectedChatUser.name} đang gọi video...
                                                </>
                                            )}
                                            {callStatus === 'connecting' && (
                                                <>
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                    Đang kết nối cuộc gọi...
                                                </>
                                            )}
                                            {callStatus === 'rejected' && (
                                                <>
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Cuộc gọi bị từ chối
                                                </>
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
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
                                {(isInCall || callStatus !== 'idle') && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                        <p className="text-sm">
                                            {isInCall ? 'Bạn đang trong cuộc gọi video' : (
                                                callStatus === 'calling' ? 'Đang thực hiện cuộc gọi...' :
                                                    callStatus === 'ringing' ? 'Có cuộc gọi đến' :
                                                        callStatus === 'connecting' ? 'Đang kết nối...' :
                                                            `Trạng thái cuộc gọi: ${callStatus}`
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Phần chi tiết cuộc trò chuyện - sidebar bên phải */}
                <AnimatePresence>
                    {selectedChatUser && rightPanelView === 'details' && (
                        <motion.div
                            key="details-panel"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex-shrink-0 overflow-hidden"
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
                                isPinned={isPinned(selectedChatUser.id)}
                                onTogglePin={handleTogglePin}
                            />
                        </motion.div>
                    )}
                    {selectedChatUser && rightPanelView === 'archive' && (
                        <motion.div
                            key="archive-panel"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="flex-shrink-0 overflow-hidden"
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
                        isDarkMode={isDarkMode}
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

            <PinNotification
                show={pinNotification.show}
                isPinned={pinNotification.isPinned}
                userName={pinNotification.userName}
                isDarkMode={isDarkMode}
            />
        </>
    );
}