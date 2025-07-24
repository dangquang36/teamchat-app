import { useState, useEffect, useMemo } from 'react';
import type { UserProfile, DirectMessage, Message, Poll } from '@/app/types';

// Giả sử bạn có dữ liệu mẫu hoặc lấy từ API
const initialDirectMessages: DirectMessage[] = [/* ...dữ liệu mẫu... */];
const initialAllMessages: Record<string, Message[]> = {/* ...dữ liệu mẫu... */ };

interface MuteInfo {
    isMuted: boolean;
    mutedUntil?: Date;
}

export const useChat = (isDarkMode: boolean) => {
    // --- STATE MANAGEMENT ---
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(initialDirectMessages);
    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialAllMessages);
    const [selectedChatId, setSelectedChatId] = useState<string>('');
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

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 3000);
    };

    // --- LOGIC (HANDLERS) ---
    const handleSendMessage = (text: string, files: File[] = []) => {
        if ((!text || !text.trim()) && files.length === 0) return;
        if (!selectedChatId) return;

        const attachments = files.map(file => ({
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
            size: file.size,
        }));

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            from: 'me',
            text: text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            reactions: [],
            type: 'text',
            attachments: attachments.length > 0 ? attachments : undefined,
        };

        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));
    };

    const handleAddContact = (user: Omit<DirectMessage, 'message'>) => {
        const newContact: DirectMessage = { ...user, message: 'Bắt đầu cuộc trò chuyện...' };
        setDirectMessages((prev) => [...prev, newContact]);
        setAllMessages((prev) => ({ ...prev, [newContact.id]: [] }));
        setSelectedChatId(newContact.id);
        setNotification({ message: `Đã thêm ${newContact.name} vào danh bạ!`, type: 'success' });
        setIsAddContactModalOpen(false);
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
            }
            setAllMessages((prev) => {
                const { [contactToDelete]: _, ...rest } = prev;
                return rest;
            });
            setNotification({ message: 'Đã xóa liên lạc thành công', type: 'success' });
            setShowConfirmDelete(false);
            setContactToDelete(null);
        }
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
        if (duration === '1_hour') mutedUntil.setHours(now.getHours() + 1);
        else if (duration === '4_hours') mutedUntil.setHours(now.getHours() + 4);
        else if (duration === 'until_8_am') {
            mutedUntil.setHours(8, 0, 0, 0);
            if (mutedUntil < now) mutedUntil.setDate(now.getDate() + 1);
        } else mutedUntil = new Date(now.getFullYear() + 100, 0, 1);

        setMuteStatus(prev => ({ ...prev, [selectedChatId!]: { isMuted: true, mutedUntil } }));
        setIsMuteModalOpen(false);
        showToast('Đã tắt thông báo');
    };

    // --- COMPUTED VALUES (useMemo) ---
    const filteredDirectMessages = useMemo(() =>
        directMessages.filter(
            (dm) =>
                dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dm.email && dm.email.toLowerCase().includes(searchQuery.toLowerCase()))
        ), [directMessages, searchQuery]);

    const selectedChatUser = useMemo(() =>
        directMessages.find((dm) => dm.id === selectedChatId),
        [directMessages, selectedChatId]);

    const currentMessages = useMemo(() =>
        allMessages[selectedChatId] || [],
        [allMessages, selectedChatId]);

    const currentMuteInfo = useMemo(() =>
        selectedChatId ? (muteStatus[selectedChatId] || { isMuted: false }) : { isMuted: false },
        [muteStatus, selectedChatId]);

    // --- RETURN API FOR COMPONENT ---
    return {
        filteredDirectMessages,
        selectedChatId,
        setSelectedChatId,
        searchQuery,
        setSearchQuery,
        isAddContactModalOpen,
        setIsAddContactModalOpen,
        handleAddContact,
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
        toast,
    };
};
