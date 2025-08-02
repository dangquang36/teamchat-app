'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, MessageCircle, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocketContext } from '@/contexts/SocketContext';
import { showToast } from '@/lib/utils';
import { useTheme } from "@/contexts/ThemeContext";
import type { DirectMessage } from '@/app/types';

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingContacts: DirectMessage[];
    onAddContact: (contact: DirectMessage) => void;
    onStartChat: (userId: string) => void;
}

interface SearchResult {
    id: string;
    name: string;
    email: string;
    avatar: string;
    username: string;
}

export function AddContactModal({
    isOpen,
    onClose,
    existingContacts,
    onAddContact,
    onStartChat
}: AddContactModalProps) {
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();
    const { isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [startedChats, setStartedChats] = useState<Set<string>>(new Set());

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setStartedChats(new Set());
        }
    }, [isOpen]);

    // Search users when query changes
    useEffect(() => {
        const searchUsers = async () => {
            if (!searchQuery.trim() || !currentUser) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await apiClient.searchUsers(searchQuery.trim(), currentUser.id);
                if (response.success && response.data) {
                    // Filter out existing contacts
                    const existingContactIds = existingContacts.map(contact => contact.id);
                    const filteredResults = response.data.filter(
                        (user: SearchResult) => !existingContactIds.includes(user.id)
                    );
                    setSearchResults(filteredResults);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, currentUser, existingContacts]);

    const handleStartChat = async (targetUser: SearchResult) => {
        if (!currentUser) {
            showToast('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.', '', 'destructive');
            return;
        }

        try {
            // Create new contact object
            const newContact: DirectMessage = {
                id: targetUser.id,
                name: targetUser.name,
                avatar: targetUser.avatar,
                message: "Bắt đầu cuộc trò chuyện", // Default message
                username: targetUser.username,
                email: targetUser.email
            };

            // Add contact to the list
            onAddContact(newContact);

            // Mark as chat started for UI
            setStartedChats(prev => new Set([...prev, targetUser.id]));

            // Start the chat conversation
            onStartChat(targetUser.id);

            // Show success toast
            showToast(`Đã bắt đầu cuộc trò chuyện với ${targetUser.name}`, '', 'success');

            // Close modal after short delay
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Start chat error:', error);
            showToast('Có lỗi xảy ra khi bắt đầu cuộc trò chuyện', '', 'destructive');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg mx-4 rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <h2 className="text-xl font-semibold">Tìm và nhắn tin</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search Input */}
                <div className="p-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-12 h-12 text-base rounded-xl border-2 focus:border-cyan-500 transition-all duration-200 ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600'
                                : 'bg-gray-50 border-gray-200 focus:bg-white'
                                }`}
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="px-6 pb-6 max-h-96 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đang tìm kiếm...</span>
                            </div>
                        </div>
                    ) : searchQuery.trim() === '' ? (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-base font-medium mb-2">Tìm kiếm bạn bè</p>
                            <p className="text-sm">Nhập tên hoặc email để tìm kiếm người dùng</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="text-4xl mb-4">😔</div>
                            <p className="text-base font-medium mb-2">Không tìm thấy kết quả</p>
                            <p className="text-sm">Không có người dùng nào với từ khóa "<span className="font-medium">{searchQuery}</span>"</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.map(user => {
                                const isChatStarted = startedChats.has(user.id);

                                return (
                                    <div
                                        key={user.id}
                                        className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${isDarkMode
                                            ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative mr-4">
                                            <img
                                                src={user.avatar || `https://i.pravatar.cc/150?u=${user.username}`}
                                                alt={user.name}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold truncate mb-1">
                                                {user.name}
                                            </h3>
                                            <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <div className="ml-4">
                                            {isChatStarted ? (
                                                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                                                    <Check className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Đã bắt đầu</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => handleStartChat(user)}
                                                    className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6 py-2 rounded-lg"
                                                    size="sm"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Nhắn tin
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}