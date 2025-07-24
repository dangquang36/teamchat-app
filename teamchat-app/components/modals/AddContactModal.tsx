'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search, UserPlus, Check, Clock } from 'lucide-react';
import type { DirectMessage } from '@/app/types';
import { apiClient } from '@/lib/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingContacts: DirectMessage[];
    isDarkMode?: boolean;
    onShowToast: (message: string) => void;
}

export function AddContactModal({ isOpen, onClose, existingContacts, isDarkMode, onShowToast }: AddContactModalProps) {
    const currentUser = useCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Omit<DirectMessage, 'message'>[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // THAY ĐỔI 1: Dùng Map để lưu trạng thái chi tiết của các lời mời đã gửi
    // Key: ID của người nhận, Value: 'pending', 'accepted', 'declined'
    const [sentRequestStatus, setSentRequestStatus] = useState<Map<string, string>>(new Map());

    // THAY ĐỔI 2: Lấy trạng thái mới nhất từ server khi modal được mở
    useEffect(() => {
        if (isOpen && currentUser) {
            const fetchSentRequests = async () => {
                const response = await apiClient.getSentFriendRequests(currentUser.id);
                if (response.success && Array.isArray(response.data)) {
                    const statusMap = new Map<string, string>();
                    response.data.forEach(req => {
                        statusMap.set(req.recipientId, req.status);
                    });
                    setSentRequestStatus(statusMap);
                }
            };
            fetchSentRequests();
        }
    }, [isOpen, currentUser]);


    // useEffect cho việc tìm kiếm (giữ nguyên)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const fetchUsers = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            const response = await apiClient.searchUsers(searchQuery, currentUser.id);
            if (response.success && Array.isArray(response.data)) {
                setSearchResults(response.data);
            } else {
                setSearchResults([]);
            }
            setIsLoading(false);
        };
        const timer = setTimeout(fetchUsers, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, currentUser]);

    // Hàm gửi lời mời
    const handleSendRequest = async (targetUser: Omit<DirectMessage, 'message'>) => {
        if (!currentUser) {
            onShowToast("Vui lòng đăng nhập lại.");
            return;
        }
        const response = await apiClient.sendFriendRequest(
            currentUser.id,
            targetUser.id,
            { requesterName: currentUser.name, requesterAvatar: currentUser.avatar }
        );
        if (response.success) {
            onShowToast('Đã gửi lời mời kết bạn!');
            // Cập nhật trạng thái ngay trên UI mà không cần chờ server
            setSentRequestStatus(prev => new Map(prev).set(targetUser.id, 'pending'));
        } else {
            onShowToast(`Lỗi: ${response.error || 'Thao tác thất bại'}`);
        }
    };

    if (!isOpen) return null;

    const existingContactIds = new Set(existingContacts.map(c => c.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className={`rounded-xl shadow-2xl w-full max-w-md flex flex-col ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}>
                {/* Header và Search Input giữ nguyên */}
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-lg font-semibold">Tìm và thêm bạn bè</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
                </div>
                <div className="p-4">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Nhập tên hoặc email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 px-4 pb-4 min-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div></div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map(user => {
                                // THAY ĐỔI 3: Logic hiển thị nút bấm phức tạp hơn
                                const isAlreadyFriend = existingContactIds.has(user.id);
                                const requestStatus = sentRequestStatus.get(user.id);

                                let buttonContent;
                                if (isAlreadyFriend || requestStatus === 'accepted') {
                                    buttonContent = (
                                        <Button size="sm" disabled className='bg-green-600 cursor-not-allowed'>
                                            <Check className="h-4 w-4 mr-1" /> Đã là bạn
                                        </Button>
                                    );
                                } else if (requestStatus === 'pending') {
                                    buttonContent = (
                                        <Button size="sm" disabled className='bg-yellow-600 cursor-not-allowed'>
                                            <Clock className="h-4 w-4 mr-1" /> Đã gửi
                                        </Button>
                                    );
                                } else {
                                    buttonContent = (
                                        <Button size="sm" onClick={() => handleSendRequest(user)} className='bg-purple-500 hover:bg-purple-600'>
                                            <UserPlus className="h-4 w-4 mr-1" /> Thêm
                                        </Button>
                                    );
                                }

                                return (
                                    <div key={user.id} className={`flex items-center justify-between p-2 rounded-lg`}>
                                        <div className="flex items-center">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                            </div>
                                        </div>
                                        {buttonContent}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 pt-10">
                            {searchQuery ? 'Không tìm thấy người dùng nào.' : 'Bắt đầu tìm kiếm để thêm bạn mới.'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}