'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Check, X, Bell } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSocketContext } from '@/contexts/SocketContext';

interface FriendRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterAvatar: string;
    status: 'pending' | 'accepted' | 'declined';
}

interface FriendRequestListProps {
    onFriendRequestAccepted?: (requesterId: string) => void;
    onShowToast: (message: string) => void;
    isDarkMode?: boolean;
}

export function FriendRequestList({ onFriendRequestAccepted, onShowToast, isDarkMode = false }: FriendRequestListProps) {
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiClient.getFriendRequests(currentUser.id);
            if (response.success && Array.isArray(response.data)) {
                setRequests(response.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Listen for real-time friend requests
    useEffect(() => {
        if (!socket || !currentUser) return;

        const handleFriendRequestReceived = (requestData: any) => {
            console.log('New friend request received:', requestData);

            // Add new request to the list
            const newRequest: FriendRequest = {
                id: requestData.id,
                requesterId: requestData.requesterId,
                requesterName: requestData.requesterName,
                requesterAvatar: requestData.requesterAvatar,
                status: 'pending'
            };

            setRequests(prev => [newRequest, ...prev]);
            onShowToast(`${requestData.requesterName} đã gửi lời mời kết bạn!`);
        };

        socket.on('friendRequestReceived', handleFriendRequestReceived);

        return () => {
            socket.off('friendRequestReceived', handleFriendRequestReceived);
        };
    }, [socket, currentUser, onShowToast]);

    const handleResponse = async (requestId: string, status: 'accepted' | 'declined', req: FriendRequest) => {
        try {
            const response = await apiClient.updateFriendRequestStatus(requestId, status);

            if (response.success) {
                // Remove request from list
                setRequests(prevRequests => prevRequests.filter(r => r.id !== requestId));

                if (status === 'accepted') {
                    if (currentUser && socket) {
                        onShowToast('Đã chấp nhận lời mời kết bạn!');
                        onFriendRequestAccepted?.(req.requesterId);

                        // Notify the requester that their request was accepted
                        socket.emit('acceptFriendRequest', {
                            recipientId: req.requesterId,
                            payload: {
                                id: currentUser.id,
                                name: currentUser.name,
                                avatar: currentUser.avatar,
                                email: currentUser.email,
                                message: `Các bạn đã là bạn bè.`
                            }
                        });
                    }
                } else {
                    onShowToast('Đã từ chối lời mời kết bạn.');
                }
            } else {
                onShowToast(`Có lỗi xảy ra: ${response.error}`);
            }
        } catch (error) {
            console.error('Error handling friend request response:', error);
            onShowToast('Có lỗi xảy ra khi xử lý lời mời kết bạn');
        }
    };

    if (isLoading) {
        return (
            <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="flex flex-col items-center space-y-3">
                    <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-cyan-400' : 'border-cyan-500'
                        } mx-auto`}></div>
                    <span className="text-sm">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className={`p-8 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Bell className="h-16 w-16 mx-auto mb-4" />
                </div>
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Không có lời mời kết bạn nào
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Các lời mời kết bạn sẽ xuất hiện ở đây
                </p>
            </div>
        );
    }

    return (
        <div className={`p-0 space-y-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <h4 className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Bell className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
                    Lời mời kết bạn ({requests.length})
                </h4>
            </div>
            <div className="space-y-0">
                {requests.map((req, index) => (
                    <div
                        key={req.id}
                        className={`flex items-center justify-between p-4 transition-colors border-b last:border-b-0 ${isDarkMode
                            ? 'hover:bg-gray-700 border-gray-700'
                            : 'hover:bg-gray-50 border-gray-200'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={req.requesterAvatar || `https://i.pravatar.cc/150?u=${req.requesterId}`}
                                    alt={req.requesterName}
                                    className={`w-12 h-12 rounded-full object-cover border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'
                                        }`}
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                            </div>
                            <div>
                                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {req.requesterName}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    muốn kết bạn với bạn
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 rounded-lg font-medium shadow-sm"
                                onClick={() => handleResponse(req.id, 'accepted', req)}
                                title="Chấp nhận"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Chấp nhận
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className={`h-9 px-4 rounded-lg font-medium shadow-sm ${isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-500'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                                onClick={() => handleResponse(req.id, 'declined', req)}
                                title="Từ chối"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Từ chối
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}