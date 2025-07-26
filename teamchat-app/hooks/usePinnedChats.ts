import { useState, useCallback, useEffect } from 'react';
import type { DirectMessage } from '@/app/types';

export function usePinnedChats() {
    const [pinnedChatIds, setPinnedChatIds] = useState<Set<string>>(new Set());

    // Load pinned chats từ localStorage khi component mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('pinnedChats');
            if (saved) {
                const pinnedIds = JSON.parse(saved) as string[];
                setPinnedChatIds(new Set(pinnedIds));
            }
        } catch (error) {
            console.error('Error loading pinned chats:', error);
        }
    }, []);

    // Save pinned chats to localStorage whenever it changes
    const savePinnedChats = useCallback((ids: Set<string>) => {
        try {
            localStorage.setItem('pinnedChats', JSON.stringify(Array.from(ids)));
        } catch (error) {
            console.error('Error saving pinned chats:', error);
        }
    }, []);

    // Check if a chat is pinned
    const isPinned = useCallback((chatId: string): boolean => {
        return pinnedChatIds.has(chatId);
    }, [pinnedChatIds]);

    // Toggle pin status of a chat
    const togglePin = useCallback((chatId: string) => {
        setPinnedChatIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }
            savePinnedChats(newSet);
            return newSet;
        });
    }, [savePinnedChats]);

    // Pin a chat
    const pinChat = useCallback((chatId: string) => {
        setPinnedChatIds(prev => {
            if (prev.has(chatId)) return prev;
            const newSet = new Set(prev);
            newSet.add(chatId);
            savePinnedChats(newSet);
            return newSet;
        });
    }, [savePinnedChats]);

    // Unpin a chat
    const unpinChat = useCallback((chatId: string) => {
        setPinnedChatIds(prev => {
            if (!prev.has(chatId)) return prev;
            const newSet = new Set(prev);
            newSet.delete(chatId);
            savePinnedChats(newSet);
            return newSet;
        });
    }, [savePinnedChats]);

    // Sort chats with pinned ones at the top
    const sortChatsWithPinned = useCallback((chats: DirectMessage[]): DirectMessage[] => {
        return [...chats].sort((a, b) => {
            const aIsPinned = pinnedChatIds.has(a.id);
            const bIsPinned = pinnedChatIds.has(b.id);

            // Pinned chats come first
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;

            // Among pinned chats, sort by name or other criteria
            if (aIsPinned && bIsPinned) {
                return a.name.localeCompare(b.name, 'vi');
            }

            // Among unpinned chats, maintain original order or sort by name
            return a.name.localeCompare(b.name, 'vi');
        });
    }, [pinnedChatIds]);

    // Get all pinned chat IDs
    const getPinnedChatIds = useCallback((): string[] => {
        return Array.from(pinnedChatIds);
    }, [pinnedChatIds]);

    // Clear all pinned chats
    const clearAllPinned = useCallback(() => {
        setPinnedChatIds(new Set());
        savePinnedChats(new Set());
    }, [savePinnedChats]);

    // Get pinned chats count
    const pinnedCount = pinnedChatIds.size;

    return {
        isPinned,
        togglePin,
        pinChat,
        unpinChat,
        sortChatsWithPinned,
        getPinnedChatIds,
        clearAllPinned,
        pinnedCount,
        pinnedChatIds: Array.from(pinnedChatIds)
    };
}