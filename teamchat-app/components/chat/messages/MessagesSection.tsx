"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, Bell } from 'lucide-react';
// Removed framer-motion - using CSS transitions only
import { ChatItem } from '@/components/chat/11/ChatItem';
import { ChatHeader } from '@/components/chat/11/ChatHeader';
import { ChatMessages } from '@/components/chat/11/ChatMessages';
import { ChatInput } from '@/components/chat/11/ChatInput';
import { UserProfileModal } from '@/components/modals/UserProfileModalChat';
import { ConversationDetails } from '@/components/modals/Awuamen/ConversationDetails';
import { AddContactModal } from '@/components/modals/hop/AddContactModal';

import { MuteBanner } from '@/components/modals/Awuamen/MuteBanner';
import { MuteNotificationsModal } from '@/components/modals/Awuamen/MuteNotificationsModal';
import { Notification } from '@/components/ui/Notification';
import { ConfirmDelete } from '@/components/ui/ConfirmDeleteDialog';
import { ArchiveView } from '@/components/modals/Awuamen/ArchiveView';
import type { UserProfile } from '@/app/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FriendRequestList } from '@/components/modals/hop/FriendRequestList';
import { FriendRequestSheet } from '@/components/modals/hop/FriendRequestSheet';
import { useChatContext } from '@/contexts/ChatContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocket } from '@/contexts/SocketContext';
import { showToast as showShadcnToast } from '@/lib/utils';

import { usePinnedChats } from '@/hooks/usePinnedChats';
import { useDebouncedToast } from '@/hooks/use-debounced-toast';



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
        showToast,
        unreadChats,
        addContact,
    } = useChatContext();

    const { isPinned, togglePin, sortChatsWithPinned } = usePinnedChats();
    const currentUser = useCurrentUser();
    const { debouncedToast } = useDebouncedToast();

    // Access call functions từ SocketContext với enhanced support
    const { initiateCall, callStatus, isInCall, callEndReason, callType } = useSocket();

    // States for UI management
    const [rightPanelView, setRightPanelView] = useState<'details' | 'archive' | 'closed'>('closed');
    const [archiveInitialTab, setArchiveInitialTab] = useState<'media' | 'files'>('media');
    const [isFriendRequestSheetOpen, setIsFriendRequestSheetOpen] = useState(false);





    // Handle call end notifications
    useEffect(() => {
        if (callEndReason && !isInCall && callStatus === 'idle') {
            // Lấy tên của người được gọi hoặc người gọi từ selectedChatUser
            const otherUserName = selectedChatUser?.name || 'Người dùng';

            // Determine call type emoji and variant
            const callTypeEmoji = callType === 'audio' ? '📞' : '📹';
            const message = `Cuộc gọi ${callType === 'audio' ? 'thoại' : 'video'} với ${otherUserName} đã kết thúc. ${callEndReason}`;

            // Show debounced toast notification to prevent duplicates
            debouncedToast(message, {
                title: `${callTypeEmoji} Cuộc gọi kết thúc`,
                variant: 'default'
            }, `call-end-${selectedChatUser?.id}`, 1000);
        }
    }, [callEndReason, isInCall, callStatus, selectedChatUser, callType, debouncedToast]);

    const handleTogglePin = () => {
        if (!selectedChatUser) return;

        const wasPinned = isPinned(selectedChatUser.id);
        togglePin(selectedChatUser.id);

        // Hiển thị thông báo bằng debounced toast
        const action = wasPinned ? 'Đã bỏ ghim' : 'Đã ghim';
        const variant = wasPinned ? 'default' : 'success';
        debouncedToast(`${action} cuộc trò chuyện với ${selectedChatUser.name}`, {
            variant,
            title: '📌 Ghim cuộc trò chuyện'
        }, `pin-${selectedChatUser.id}`, 500);
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
            // Mặc định sẽ gọi video call khi gọi từ profile
            handleVideoCall();
        }
    };

    // Handle video call - tích hợp với LiveKit system
    const handleVideoCall = () => {
        if (!selectedChatUser || !currentUser || callStatus !== 'idle') {
            console.log('Cannot initiate video call:', { selectedChatUser, callStatus });
            return;
        }
        console.log('Initiating video call to:', selectedChatUser.name);
        initiateCall(selectedChatUser.id, selectedChatUser.name, 'video');
    };

    // Handle audio call - gọi thoại chỉ có âm thanh
    const handleAudioCall = () => {
        if (!selectedChatUser || !currentUser || callStatus !== 'idle') {
            console.log('Cannot initiate audio call:', { selectedChatUser, callStatus });
            return;
        }
        console.log('Initiating audio call to:', selectedChatUser.name);
        initiateCall(selectedChatUser.id, selectedChatUser.name, 'audio');
    };

    // Get call status display info với tên chính xác
    const getCallStatusInfo = () => {
        if (!selectedChatUser) return null;

        if (isInCall) {
            const callTypeText = callType === 'audio' ? 'thoại' : 'video';
            return {
                text: `Đang trong cuộc gọi ${callTypeText} với ${selectedChatUser.name}`,
                color: 'green',
                icon: 'phone'
            };
        }

        switch (callStatus) {
            case 'calling':
                const callingTypeText = callType === 'audio' ? 'thoại' : 'video';
                return {
                    text: `Đang gọi ${callingTypeText} ${selectedChatUser.name}...`,
                    color: 'yellow',
                    icon: 'calling'
                };
            case 'ringing':
                const ringingTypeText = callType === 'audio' ? 'thoại' : 'video';
                return {
                    text: `${selectedChatUser.name} đang gọi ${ringingTypeText}...`,
                    color: 'blue',
                    icon: 'ringing'
                };
            case 'connecting':
                return {
                    text: `Đang kết nối cuộc gọi với ${selectedChatUser.name}...`,
                    color: 'orange',
                    icon: 'connecting'
                };
            case 'rejected':
                return {
                    text: `${selectedChatUser.name} đã từ chối cuộc gọi`,
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

            <div className="flex h-screen w-full bg-gradient-to-br from-purple-50 to-blue-50 dark:bg-gray-900 overflow-hidden relative">
                {/* Phần danh sách chat bên trái */}
                <div className={`w-80 border-r transition-colors duration-300 flex-shrink-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 backdrop-blur-none' : 'bg-white/90 backdrop-blur-sm border-purple-100'}`}>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Tin Nhắn
                                {/* Enhanced Call status indicator with call type */}
                                {isInCall && selectedChatUser && (
                                    <span className={`text-xs text-white px-2 py-1 rounded-full animate-pulse flex items-center gap-1 animate-in zoom-in duration-200 ${callType === 'audio' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                        {callType === 'audio' ? 'Gọi thoại' : 'Gọi video'} với {selectedChatUser.name}
                                    </span>
                                )}
                                {callStatus !== 'idle' && !isInCall && selectedChatUser && (
                                    <span className={`text-xs text-white px-2 py-1 rounded-full flex items-center gap-1 animate-in zoom-in duration-200 ${callStatus === 'calling' ? 'bg-orange-500' :
                                        callStatus === 'ringing' ? 'bg-blue-500 animate-pulse' :
                                            callStatus === 'connecting' ? 'bg-yellow-500' :
                                                callStatus === 'rejected' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 bg-white rounded-full ${callStatus === 'ringing' ? 'animate-ping' :
                                            callStatus === 'calling' ? 'animate-bounce' : ''
                                            }`}></div>
                                        {callStatus === 'calling' ? `Gọi ${selectedChatUser.name}` :
                                            callStatus === 'ringing' ? `${selectedChatUser.name} gọi đến` :
                                                callStatus === 'connecting' ? `Kết nối với ${selectedChatUser.name}` :
                                                    callStatus === 'rejected' ? `${selectedChatUser.name} từ chối` :
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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 backdrop-blur-none'
                                    : 'bg-white/90 backdrop-blur-sm border-purple-200 text-gray-900 placeholder-gray-500'
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
                                {sortedDirectMessages.map((dm) => (
                                    <div
                                        key={dm.id}
                                        className="relative group animate-in slide-in-from-left duration-200"
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần khung chat chính - điều chỉnh width dựa trên rightPanelView */}
                <div
                    className="flex flex-col min-w-0 transition-all duration-300"
                    style={{
                        width: rightPanelView !== 'closed'
                            ? 'calc(100% - 320px - 320px)' // left sidebar (320px) + right sidebar (320px)
                            : 'calc(100% - 320px)' // chỉ left sidebar (320px)
                    }}
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
                                callStatus={callStatus}
                                isInCall={isInCall}
                            />

                            {/* Mute Banner */}

                            {currentMuteInfo.isMuted && (
                                <div className="animate-in slide-in-from-top duration-300">
                                    <MuteBanner
                                        mutedUntil={formatMutedUntil(currentMuteInfo.mutedUntil)}
                                        onUnmute={handleToggleMute}
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            )}


                            {/* Enhanced Call status banner */}

                            {callStatusInfo && (
                                <div className={`p-4 text-center border-b ${isDarkMode ? 'backdrop-blur-none' : 'backdrop-blur-sm'} animate-in slide-in-from-top duration-200 ${callStatusInfo.color === 'green' ? (isDarkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800') :
                                    callStatusInfo.color === 'yellow' ? (isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800') :
                                        callStatusInfo.color === 'blue' ? (isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800') :
                                            callStatusInfo.color === 'orange' ? (isDarkMode ? 'bg-orange-900 border-orange-700 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-800') :
                                                callStatusInfo.color === 'red' ? (isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800') :
                                                    (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800')
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div
                                            className={`w-3 h-3 rounded-full ${callStatusInfo.color === 'green' ? 'bg-green-500' :
                                                callStatusInfo.color === 'yellow' ? 'bg-yellow-500' :
                                                    callStatusInfo.color === 'blue' ? 'bg-blue-500' :
                                                        callStatusInfo.color === 'orange' ? 'bg-orange-500' :
                                                            callStatusInfo.color === 'red' ? 'bg-red-500' :
                                                                'bg-gray-500'
                                                } ${callStatusInfo.icon === 'ringing' || isInCall ? 'animate-pulse' : ''}`}
                                        />
                                        <span className="font-medium">
                                            {callStatusInfo.text}
                                        </span>
                                        {/* Call type indicator */}
                                        {(callStatus === 'calling' || callStatus === 'connecting' || isInCall) && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${callType === 'audio'
                                                ? 'bg-green-500/20 text-green-300'
                                                : 'bg-blue-500/20 text-blue-300'
                                                }`}>
                                                {callType === 'audio' ? '🎤 Thoại' : '📹 Video'}
                                            </span>
                                        )}
                                        {(callStatus === 'calling' || callStatus === 'connecting') && (
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                                            </div>
                                        )}
                                    </div>
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
                        <div className={`flex-1 flex items-center justify-center transition-colors duration-300 animate-in fade-in duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="text-center max-w-md">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-lg mb-2">Chọn một cuộc trò chuyện để bắt đầu</p>

                                {/* Global call status when no chat selected */}

                                {callStatusInfo && (
                                    <div className={`mt-4 p-4 rounded-lg border animate-in slide-in-from-bottom-1 duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${callStatusInfo.color === 'green' ? 'bg-green-500' :
                                                callStatusInfo.color === 'blue' ? 'bg-blue-500' :
                                                    callStatusInfo.color === 'yellow' ? 'bg-yellow-500' :
                                                        callStatusInfo.color === 'orange' ? 'bg-orange-500' :
                                                            'bg-red-500'
                                                }`} />
                                            <span className="text-sm font-medium">
                                                {callStatusInfo.text}
                                            </span>
                                            {callType && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${callType === 'audio'
                                                    ? 'bg-green-500/20 text-green-600'
                                                    : 'bg-blue-500/20 text-blue-600'
                                                    }`}>
                                                    {callType === 'audio' ? 'Thoại' : 'Video'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs opacity-75">
                                            Chọn cuộc trò chuyện để xem chi tiết cuộc gọi
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>

                {/* Phần chi tiết cuộc trò chuyện - sidebar bên phải */}
                {selectedChatUser && rightPanelView === 'details' && (
                    <div
                        key="details-panel"
                        className="flex-shrink-0 overflow-hidden border-l animate-in slide-in-from-right duration-300"
                        style={{
                            width: '320px',
                            borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                        }}
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
                    </div>
                )}
                {selectedChatUser && rightPanelView === 'archive' && (
                    <div
                        key="archive-panel"
                        className="flex-shrink-0 overflow-hidden border-l animate-in slide-in-from-right duration-300"
                        style={{
                            width: '320px',
                            borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                        }}
                    >
                        <ArchiveView
                            initialTab={archiveInitialTab}
                            mediaFiles={mediaFiles}
                            otherFiles={otherFiles}
                            onClose={handleCloseArchive}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}
            </div>

            {/* Các modal được quản lý ở đây */}
            {viewingProfile && (
                <UserProfileModal
                    user={viewingProfile}
                    onClose={() => setViewingProfile(null)}
                    onSendMessage={handleMessageFromProfile}
                    onStartCall={() => handleCallFromProfile(viewingProfile)}
                    isDarkMode={isDarkMode}
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
                    isDarkMode={isDarkMode}
                />
            )}

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
                onAddContact={addContact}
                onStartChat={setSelectedChatId}
            />

            <MuteNotificationsModal
                isOpen={isMuteModalOpen}
                onClose={() => setIsMuteModalOpen(false)}
                onConfirm={handleConfirmMute}
                isDarkMode={isDarkMode}
            />
        </>
    );
}