import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, DirectMessage, Message } from '@/app/types';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from './useCurrentUser';
import { useSocketContext } from '@/contexts/SocketContext';

const initialAllMessages: Record<string, Message[]> = {};

interface MuteInfo {
    isMuted: boolean;
    mutedUntil?: Date;
}

export const useChat = (isDarkMode: boolean) => {
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialAllMessages);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [unreadChats, setUnreadChats] = useState<Record<string, number>>({});
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
    const [muteStatus, setMuteStatus] = useState<Record<string, MuteInfo>>({});
    const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

    // Tạo chatId từ 2 userId (luôn sắp xếp để đảm bảo consistent)
    const createChatId = useCallback((userId1: string, userId2: string) => {
        return [userId1, userId2].sort().join('-');
    }, []);

    // Convert file to base64 để có thể chia sẻ qua socket
    const fileToBase64 = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }, []);

    const receiveNewMessage = useCallback(async (chatId: string, newMessage: Message) => {
        // Cập nhật tin nhắn vào allMessages
        setAllMessages(prev => {
            const currentHistory = prev[chatId] || [];
            // Kiểm tra trùng lặp tin nhắn
            if (currentHistory.some(msg => msg.id === newMessage.id)) return prev;

            return { ...prev, [chatId]: [...currentHistory, newMessage] };
        });

        if (!currentUser) return;

        // Tìm ID người gửi (khác với currentUser)
        const otherUserId = chatId.split('-').find(id => id !== currentUser.id);
        if (!otherUserId) return;

        // Cập nhật danh sách directMessages với tin nhắn mới nhất
        const contactExists = directMessages.some(dm => dm.id === otherUserId);
        if (contactExists) {
            setDirectMessages(prev => {
                const chatIndex = prev.findIndex(dm => dm.id === otherUserId);
                if (chatIndex === -1) return prev;

                const updatedChat = {
                    ...prev[chatIndex],
                    message: newMessage.text || '[Tệp đính kèm]'
                };

                // Di chuyển cuộc trò chuyện lên đầu danh sách
                const otherChats = prev.filter(dm => dm.id !== otherUserId);
                return [updatedChat, ...otherChats];
            });
        } else {
            // Nếu chưa có contact, thêm mới
            const response = await apiClient.getUserById(otherUserId);
            if (response.success && response.data) {
                const newContact: DirectMessage = {
                    ...response.data,
                    message: newMessage.text || '[Tệp đính kèm]'
                };
                setDirectMessages(prev => [newContact, ...prev]);
            }
        }

        // Tăng số tin nhắn chưa đọc nếu không phải chat hiện tại
        if (chatId !== selectedChatId) {
            setUnreadChats(prevUnread => ({
                ...prevUnread,
                [otherUserId]: (prevUnread[otherUserId] || 0) + 1,
            }));
        }
    }, [currentUser, selectedChatId, directMessages]);

    const handleSelectChat = (userId: string | null) => {
        if (userId && currentUser) {
            // Tạo chatId từ currentUser và userId được chọn
            const chatId = createChatId(currentUser.id, userId);
            setSelectedChatId(chatId);

            // Reset số tin nhắn chưa đọc
            setUnreadChats(prev => ({ ...prev, [userId]: 0 }));
        } else {
            setSelectedChatId(null);
        }
    };

    const fetchInitialContacts = useCallback(async () => {
        if (currentUser) {
            const response = await apiClient.getContacts(currentUser.id);
            if (response.success && response.data) {
                setDirectMessages(response.data);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        fetchInitialContacts();
    }, [currentUser, fetchInitialContacts]);

    const handleSendMessage = useCallback(async (text: string, files: File[] = []) => {
        if ((!text.trim() && files.length === 0) || !selectedChatId || !currentUser || !socket) return;

        // Tìm người nhận từ selectedChatId
        const otherUserId = selectedChatId.split('-').find(id => id !== currentUser.id);
        if (!otherUserId) return;

        // Xử lý files để tạo attachments với base64
        const attachments = await Promise.all(
            files.map(async (file) => {
                try {
                    const base64Data = await fileToBase64(file);
                    return {
                        id: `file-${Date.now()}-${Math.random()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: base64Data, // Sử dụng base64 để có thể chia sẻ
                        base64: base64Data // Backup base64 data
                    };
                } catch (error) {
                    console.error('Error converting file to base64:', error);
                    return {
                        id: `file-${Date.now()}-${Math.random()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        url: URL.createObjectURL(file), // Fallback to object URL
                        base64: null
                    };
                }
            })
        );

        // Tạo tin nhắn mới
        const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            from: currentUser.id,
            text: text.trim(),
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            reactions: [],
            type: 'text',
            attachments: attachments,
        };

        // Cập nhật tin nhắn ngay lập tức cho người gửi
        receiveNewMessage(selectedChatId, newMessage);

        // Gửi tin nhắn qua socket với đầy đủ dữ liệu
        socket.emit('privateMessage', {
            recipientId: otherUserId,
            payload: {
                message: newMessage,
                fromUserId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar
            }
        });

    }, [currentUser, selectedChatId, receiveNewMessage, socket, fileToBase64]);

    const showToast = useCallback((message: string) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }, []);

    const addContact = useCallback((newContact: DirectMessage) => {
        setDirectMessages(prev => {
            if (prev.some(c => c.id === newContact.id)) return prev;
            return [newContact, ...prev];
        });
    }, []);

    const handleDeleteContact = useCallback((contactId: string) => {
        setContactToDelete(contactId);
        setShowConfirmDelete(true);
    }, []);

    const confirmDeleteContact = useCallback(() => {
        if (!contactToDelete || !currentUser) return;

        setDirectMessages(prev => prev.filter(dm => dm.id !== contactToDelete));

        const deletedChatId = createChatId(currentUser.id, contactToDelete);
        if (selectedChatId === deletedChatId) {
            setSelectedChatId(null);
        }

        setShowConfirmDelete(false);
        setContactToDelete(null);
        showToast("Đã xóa liên hệ.");
    }, [contactToDelete, currentUser, selectedChatId, showToast, createChatId]);

    const refreshContacts = useCallback(() => {
        fetchInitialContacts();
    }, [fetchInitialContacts]);

    const handleToggleMute = useCallback(() => {
        if (!selectedChatId) return;

        const currentMuteInfo = muteStatus[selectedChatId] || { isMuted: false };

        if (currentMuteInfo.isMuted) {
            setMuteStatus(prev => ({
                ...prev,
                [selectedChatId]: { isMuted: false }
            }));
            showToast("Đã bật thông báo cho cuộc trò chuyện này");
        } else {
            setIsMuteModalOpen(true);
        }
    }, [selectedChatId, muteStatus, showToast]);

    const handleConfirmMute = useCallback((duration: string) => {
        if (!selectedChatId) return;

        let mutedUntil: Date | undefined;

        switch (duration) {
            case '1_hour':
                mutedUntil = new Date(Date.now() + 60 * 60 * 1000);
                break;
            case '4_hours':
                mutedUntil = new Date(Date.now() + 4 * 60 * 60 * 1000);
                break;
            case 'until_8_am':
                mutedUntil = new Date();
                mutedUntil.setDate(mutedUntil.getDate() + 1);
                mutedUntil.setHours(8, 0, 0, 0);
                break;
            case 'until_reopened':
                mutedUntil = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
                break;
            default:
                mutedUntil = new Date(Date.now() + 60 * 60 * 1000);
        }

        setMuteStatus(prev => ({
            ...prev,
            [selectedChatId]: {
                isMuted: true,
                mutedUntil
            }
        }));

        setIsMuteModalOpen(false);
        showToast("Đã tắt thông báo cho cuộc trò chuyện này");
    }, [selectedChatId, showToast]);

    // Computed values
    const filteredDirectMessages = useMemo(() =>
        directMessages.filter(dm =>
            dm.name.toLowerCase().includes(searchQuery.toLowerCase())
        ), [directMessages, searchQuery]
    );

    const selectedChatUser = useMemo(() => {
        if (!selectedChatId || !currentUser) return undefined;
        const otherUserId = selectedChatId.split('-').find(id => id !== currentUser.id);
        return directMessages.find((dm) => dm.id === otherUserId);
    }, [directMessages, selectedChatId, currentUser]);

    const currentMessages = useMemo(() =>
        selectedChatId ? allMessages[selectedChatId] || [] : [],
        [allMessages, selectedChatId]
    );

    const currentMuteInfo = useMemo(() =>
        selectedChatId ? (muteStatus[selectedChatId] || { isMuted: false }) : { isMuted: false },
        [muteStatus, selectedChatId]
    );

    return {
        directMessages,
        selectedChatId,
        searchQuery,
        unreadChats,
        filteredDirectMessages,
        selectedChatUser,
        currentMessages,
        isDetailsOpen,
        viewingProfile,
        toast,
        notification,
        isAddContactModalOpen,
        showConfirmDelete,
        contactToDelete,
        currentMuteInfo,
        isMuteModalOpen,
        setSelectedChatId: handleSelectChat,
        setSearchQuery,
        handleSendMessage,
        receiveNewMessage,
        showToast,
        setIsDetailsOpen,
        setViewingProfile,
        setNotification,
        setIsAddContactModalOpen,
        setShowConfirmDelete,
        setIsMuteModalOpen,
        handleToggleMute,
        handleConfirmMute,
        handleDeleteContact,
        confirmDeleteContact,
        addContact,
        refreshContacts,
    };
};