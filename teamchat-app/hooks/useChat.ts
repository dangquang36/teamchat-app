import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, DirectMessage, Message } from '@/app/types';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from './useCurrentUser';

const initialAllMessages: Record<string, Message[]> = {};

interface MuteInfo {
    isMuted: boolean;
    mutedUntil?: Date;
}

export const useChat = (isDarkMode: boolean) => {
    const currentUser = useCurrentUser();
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialAllMessages);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
    const [muteStatus, setMuteStatus] = useState<Record<string, MuteInfo>>({});
    const [toast, setToast] = useState({ show: false, message: '' });

    const addContact = useCallback((newContact: DirectMessage) => {
        setDirectMessages(prevContacts => {
            if (prevContacts.some(contact => contact.id === newContact.id)) {
                return prevContacts;
            }
            return [newContact, ...prevContacts];
        });
    }, []);

    // SỬA LẠI HOÀN TOÀN HÀM NÀY ĐỂ ĐẢM BẢO RE-RENDER
    const receiveNewMessage = useCallback(async (chatId: string, newMessage: Message) => {
        // Cập nhật kho tin nhắn. Việc tạo một object mới ở đây là RẤT QUAN TRỌNG.
        setAllMessages(prev => {
            const currentHistory = prev[chatId] || [];
            if (currentHistory.some(msg => msg.id === newMessage.id)) return prev;
            return {
                ...prev,
                [chatId]: [...currentHistory, newMessage]
            };
        });

        if (!currentUser) return;

        const otherUserId = chatId.split('-').find(id => id !== currentUser.id);
        if (!otherUserId) return;

        const contactExists = directMessages.some(dm => dm.id === otherUserId);

        if (contactExists) {
            setDirectMessages(prev => {
                const chatIndex = prev.findIndex(dm => dm.id === otherUserId);
                if (chatIndex === -1) return prev;
                const updatedChat = { ...prev[chatIndex], message: newMessage.text || '[Tệp đính kèm]' };
                const otherChats = prev.filter(dm => dm.id !== otherUserId);
                return [updatedChat, ...otherChats];
            });
        } else {
            const res = await apiClient.getUserById(otherUserId);
            if (res.success && res.data) {
                const newContact: DirectMessage = { ...res.data, message: newMessage.text || '[Tệp đính kèm]' };
                addContact(newContact);
            }
        }

        setSelectedChatId(prev => !prev ? chatId : prev);

    }, [currentUser, directMessages, addContact]);

    const fetchInitialContacts = useCallback(async () => {
        if (!currentUser) return;
        const response = await apiClient.getContacts(currentUser.id);
        if (response.success && response.data) {
            setDirectMessages(response.data);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchInitialContacts();
        }
    }, [currentUser, fetchInitialContacts]);

    const showToast = useCallback((message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 3000);
    }, []);

    const handleSendMessage = useCallback((text: string, files: File[] = []) => {
        if ((!text.trim() && files.length === 0) || !selectedChatId || !currentUser) return;

        const otherUserId = selectedChatId.split('-').find(id => id !== currentUser.id);
        if (!otherUserId) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            from: currentUser.id,
            text: text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            reactions: [], type: 'text', attachments: undefined,
        };

        receiveNewMessage(selectedChatId, newMessage);

        fetch('/api/messages/sendData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipientId: otherUserId,
                eventType: 'NEW_MESSAGE',
                payload: { message: newMessage, fromUserId: currentUser.id }
            })
        }).catch(err => console.error("Lỗi gửi tin nhắn real-time:", err));
    }, [currentUser, selectedChatId, receiveNewMessage]);

    const handleAddContact = useCallback((user: Omit<DirectMessage, 'message'>) => {
        if (!currentUser) return;
        const newContact: DirectMessage = { ...user, message: 'Bắt đầu cuộc trò chuyện...' };
        addContact(newContact);
        const newChatId = [currentUser.id, newContact.id].sort().join('-');
        setAllMessages((prev) => ({ ...prev, [newChatId]: [] }));
        setSelectedChatId(newChatId);
        setNotification({ message: `Đã thêm ${newContact.name} vào danh bạ!`, type: 'success' });
        setIsAddContactModalOpen(false);
    }, [addContact, currentUser]);

    const handleDeleteContact = useCallback((contactId: string) => {
        const contact = directMessages.find((dm) => dm.id === contactId);
        if (contact) {
            setContactToDelete(contactId);
            setShowConfirmDelete(true);
        }
    }, [directMessages]);

    const confirmDeleteContact = useCallback(() => {
        if (contactToDelete && currentUser) {
            const deletedChatId = [currentUser.id, contactToDelete].sort().join('-');
            setDirectMessages((prev) => prev.filter((dm) => dm.id !== contactToDelete));
            if (selectedChatId === deletedChatId) {
                setSelectedChatId(null);
            }
            setAllMessages((prev) => {
                const { [deletedChatId]: _, ...rest } = prev;
                return rest;
            });
            setNotification({ message: 'Đã xóa liên lạc thành công', type: 'success' });
            setShowConfirmDelete(false);
            setContactToDelete(null);
        }
    }, [contactToDelete, selectedChatId, currentUser]);

    const handleToggleMute = useCallback(() => {
        if (!selectedChatId) return;
        const currentMuteInfo = muteStatus[selectedChatId] || { isMuted: false };
        if (currentMuteInfo.isMuted) {
            setMuteStatus(prev => ({ ...prev, [selectedChatId]: { isMuted: false, mutedUntil: undefined } }));
            showToast('Đã bật lại thông báo');
        } else {
            setIsMuteModalOpen(true);
        }
    }, [muteStatus, selectedChatId, showToast]);

    const handleConfirmMute = useCallback((duration: string) => {
        if (!selectedChatId) return;
        const now = new Date();
        let mutedUntil = new Date();
        if (duration === '1_hour') mutedUntil.setHours(now.getHours() + 1);
        else if (duration === '4_hours') mutedUntil.setHours(now.getHours() + 4);
        else if (duration === 'until_8_am') {
            mutedUntil.setHours(8, 0, 0, 0);
            if (mutedUntil < now) mutedUntil.setDate(now.getDate() + 1);
        } else mutedUntil = new Date(now.getFullYear() + 100, 0, 1);

        setMuteStatus(prev => ({ ...prev, [selectedChatId]: { isMuted: true, mutedUntil } }));
        setIsMuteModalOpen(false);
        showToast('Đã tắt thông báo');
    }, [selectedChatId, showToast]);

    const refreshContacts = useCallback(async () => {
        await fetchInitialContacts();
    }, [fetchInitialContacts]);

    const filteredDirectMessages = useMemo(() =>
        directMessages.filter(
            (dm) =>
                dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dm.email && dm.email.toLowerCase().includes(searchQuery.toLowerCase()))
        ), [directMessages, searchQuery]);

    const selectedChatUser = useMemo(() => {
        if (!selectedChatId || !currentUser) return undefined;
        const otherUserId = selectedChatId.split('-').find(id => id !== currentUser.id);
        return directMessages.find((dm) => dm.id === otherUserId);
    }, [directMessages, selectedChatId, currentUser]);

    const currentMessages = useMemo(() =>
        selectedChatId ? allMessages[selectedChatId] || [] : [],
        [allMessages, selectedChatId]);

    const currentMuteInfo = useMemo(() =>
        selectedChatId ? (muteStatus[selectedChatId] || { isMuted: false }) : { isMuted: false },
        [muteStatus, selectedChatId]);

    return {
        filteredDirectMessages, selectedChatId, setSelectedChatId, searchQuery, setSearchQuery,
        isAddContactModalOpen, setIsAddContactModalOpen, handleAddContact, handleDeleteContact,
        showConfirmDelete, setShowConfirmDelete, confirmDeleteContact, contactToDelete,
        directMessages, notification, setNotification, selectedChatUser, currentMessages,
        isDetailsOpen, setIsDetailsOpen, viewingProfile, setViewingProfile, currentMuteInfo,
        handleToggleMute, isMuteModalOpen, setIsMuteModalOpen, handleConfirmMute,
        handleSendMessage, toast, refreshContacts, showToast,
        addContact,
        receiveNewMessage,
    };
};