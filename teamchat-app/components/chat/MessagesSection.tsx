"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatItem } from './ChatItem';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { CallEndNotification } from '@/components/modals/Call/CallEndNotification';
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
    const currentUser = useCurrentUser();

    // Access call functions từ SocketContext
    const { initiateCall, callStatus, isInCall, callEndReason } = useSocket();

    // States for UI management
    const [rightPanelView, setRightPanelView] = useState<'details' | 'archive' | 'closed'>('closed');
    const [archiveInitialTab, setArchiveInitialTab] = useState<'media' | 'files'>('media');
    const [isFriendRequestSheetOpen, setIsFriendRequestSheetOpen] = useState(false);

    // Call End Notification states
    const [showCallEndNotification, setShowCallEndNotification] = useState(false);
    const [callEndNotificationData, setCallEndNotificationData] = useState<{
        reason: string;
        callerName?: string;
        duration?: string;
    } | null>(null);

    // Pin notification state
    const [pinNotification, setPinNotification] = useState<{
        show: boolean;
        isPinned: boolean;
        userName: string;
    }>({
        show: false,
        isPinned: false,
        userName: ''
    });

    // Handle call end notifications
    useEffect(() => {
        if (callEndReason && !isInCall && callStatus === 'idle') {
            setCallEndNotificationData({
                reason: callEndReason,
                callerName: selectedChatUser?.name,
                duration: undefined // You can add call duration tracking here
            });
            setShowCallEndNotification(true);
        }
    }, [callEndReason, isInCall, callStatus, selectedChatUser?.name]);

    const handleDismissCallEndNotification = () => {
        setShowCallEndNotification(false);
        setCallEndNotificationData(null);
    };

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

    // Get call status display info
    const getCallStatusInfo = () => {
        if (isInCall) {
            return {
                text: `Đang trong cuộc gọi video với ${selectedChatUser?.name}`,
                color: 'green',
                icon: 'phone'
            };
        }

        switch (callStatus) {
            case 'calling':
                return {
                    text: `Đang gọi ${selectedChatUser?.name}...`,
                    color: 'yellow',
                    icon: 'calling'
                };
            case 'ringing':
                return {
                    text: `${selectedChatUser?.name} đang gọi video...`,
                    color: 'blue',
                    icon: 'ringing'
                };
            case 'connecting':
                return {
                    text: 'Đang kết nối cuộc gọi...',
                    color: 'orange',
                    icon: 'connecting'
                };
            case 'rejected':
                return {
                    text: 'Cuộc gọi bị từ chối',
                    color: 'red',
                    icon: 'rejected'
                };
            default:
                return null;
        }
    };

    const callStatusInfo = getCallStatusInfo();

    return (
        <>
            {/* Call End Notification - Global */}
            {callEndNotificationData && (
                <CallEndNotification
                    callEndReason={callEndNotificationData.reason}
                    callerName={callEndNotificationData.callerName}
                    callDuration={callEndNotificationData.duration}
                    isVisible={showCallEndNotification}
                    onDismiss={handleDismissCallEndNotification}
                    isDarkMode={isDarkMode}
                />
            )}

            <div className="flex h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
                {/* Phần danh sách chat bên trái */}
                <div className={`w-80 border-r transition-colors duration-300 flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Tin Nhắn
                                {/* Enhanced Call status indicator */}
                                {isInCall && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse flex items-center gap-1"
                                    >
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                        Đang gọi
                                    </motion.span>
                                )}
                                {callStatus !== 'idle' && !isInCall && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`text-xs text-white px-2 py-1 rounded-full flex items-center gap-1 ${callStatus === 'calling' ? 'bg-orange-500' :
                                            callStatus === 'ringing' ? 'bg-blue-500 animate-pulse' :
                                                callStatus === 'connecting' ? 'bg-yellow-500' :
                                                    callStatus === 'rejected' ? 'bg-red-500' :
                                                        'bg-gray-500'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 bg-white rounded-full ${callStatus === 'ringing' ? 'animate-ping' :
                                            callStatus === 'calling' ? 'animate-bounce' : ''
                                            }`}></div>
                                        {callStatus === 'calling' ? 'Đang gọi...' :
                                            callStatus === 'ringing' ? 'Có cuộc gọi đến' :
                                                callStatus === 'connecting' ? 'Kết nối...' :
                                                    callStatus === 'rejected' ? 'Bị từ chối' :
                                                        callStatus}
                                    </motion.span>
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

                            {/* Mute Banner */}
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

                            {/* Enhanced Call status banner */}
                            <AnimatePresence>
                                {callStatusInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-4 text-center border-b backdrop-blur-sm ${callStatusInfo.color === 'green' ? (isDarkMode ? 'bg-green-900/50 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800') :
                                            callStatusInfo.color === 'yellow' ? (isDarkMode ? 'bg-yellow-900/50 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800') :
                                                callStatusInfo.color === 'blue' ? (isDarkMode ? 'bg-blue-900/50 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800') :
                                                    callStatusInfo.color === 'orange' ? (isDarkMode ? 'bg-orange-900/50 border-orange-700 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-800') :
                                                        callStatusInfo.color === 'red' ? (isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800') :
                                                            (isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800')
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            <motion.div
                                                className={`w-3 h-3 rounded-full ${callStatusInfo.color === 'green' ? 'bg-green-500' :
                                                    callStatusInfo.color === 'yellow' ? 'bg-yellow-500' :
                                                        callStatusInfo.color === 'blue' ? 'bg-blue-500' :
                                                            callStatusInfo.color === 'orange' ? 'bg-orange-500' :
                                                                callStatusInfo.color === 'red' ? 'bg-red-500' :
                                                                    'bg-gray-500'
                                                    }`}
                                                animate={{
                                                    scale: callStatusInfo.icon === 'ringing' ? [1, 1.2, 1] : 1,
                                                    opacity: isInCall ? [1, 0.5, 1] : 1
                                                }}
                                                transition={{
                                                    duration: callStatusInfo.icon === 'ringing' ? 1 : 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                            <span className="font-medium">
                                                {callStatusInfo.text}
                                            </span>
                                            {(callStatus === 'calling' || callStatus === 'connecting') && (
                                                <div className="flex gap-1">
                                                    <motion.div
                                                        className="w-1 h-1 bg-current rounded-full"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                                    />
                                                    <motion.div
                                                        className="w-1 h-1 bg-current rounded-full"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                                    />
                                                    <motion.div
                                                        className="w-1 h-1 bg-current rounded-full"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                                    />
                                                </div>
                                            )}
                                        </div>
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
                            <div className="text-center max-w-md">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-lg mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>

                                {/* Global call status when no chat selected */}
                                <AnimatePresence>
                                    {callStatusInfo && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className={`mt-4 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <motion.div
                                                    className={`w-2 h-2 rounded-full ${callStatusInfo.color === 'green' ? 'bg-green-500' :
                                                        callStatusInfo.color === 'blue' ? 'bg-blue-500' :
                                                            callStatusInfo.color === 'yellow' ? 'bg-yellow-500' :
                                                                callStatusInfo.color === 'orange' ? 'bg-orange-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [1, 0.5, 1]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                                <span className="text-sm font-medium">
                                                    {callStatusInfo.text}
                                                </span>
                                            </div>
                                            <p className="text-xs opacity-75">
                                                Chọn cuộc trò chuyện để xem chi tiết cuộc gọi
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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