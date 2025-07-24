'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Định nghĩa kiểu dữ liệu cho một lời mời
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
}

export function FriendRequestList({ onFriendRequestAccepted, onShowToast }: FriendRequestListProps) {
    const currentUser = useCurrentUser();
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Hàm để tải danh sách lời mời
    useEffect(() => {
        const fetchRequests = async () => {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const response = await apiClient.getFriendRequests(currentUser.id);
            if (response.success && Array.isArray(response.data)) {
                setRequests(response.data);
            }
            setIsLoading(false);
        };

        fetchRequests();
    }, [currentUser]);

    // Hàm xử lý khi nhấn nút Chấp nhận hoặc Từ chối
    const handleResponse = async (requestId: string, status: 'accepted' | 'declined', req: FriendRequest) => {
        const response = await apiClient.updateFriendRequestStatus(requestId, status);

        if (response.success) {
            setRequests(prevRequests => prevRequests.filter(r => r.id !== requestId));

            if (status === 'accepted' && currentUser) {
                onShowToast('Đã chấp nhận lời mời kết bạn!');
                onFriendRequestAccepted?.(req.requesterId);

                // GỬI THÔNG BÁO REAL-TIME qua API đã hợp nhất
                try {
                    await fetch('/api/messages/sendData', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipientId: req.requesterId, // Gửi đến người đã gửi lời mời (User A)
                            eventType: 'FRIEND_REQUEST_ACCEPTED',
                            payload: {
                                // Gửi thông tin của mình (User B)
                                id: currentUser.id,
                                name: currentUser.name,
                                avatar: currentUser.avatar,
                                email: currentUser.email,
                                message: `Các bạn đã là bạn bè.`
                            }
                        })
                    });
                } catch (err) {
                    console.error("Lỗi gửi thông báo chấp nhận kết bạn:", err);
                }
            }
        } else {
            onShowToast(`Có lỗi xảy ra: ${response.error}`);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center text-sm text-gray-400">Đang tải...</div>;
    }

    if (requests.length === 0) {
        return <div className="p-4 text-center text-sm text-gray-500">Không có lời mời kết bạn nào.</div>;
    }

    return (
        <div className="p-2 space-y-2">
            <h4 className="font-semibold px-2">Lời mời kết bạn</h4>
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700">
                    <div className="flex items-center">
                        <img src={req.requesterAvatar || `https://i.pravatar.cc/150?u=${req.requesterId}`} alt={req.requesterName} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                            <p className="font-medium">{req.requesterName}</p>
                            <p className="text-sm text-gray-400">muốn kết bạn.</p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 h-8 w-8"
                            onClick={() => handleResponse(req.id, 'accepted', req)}
                            title="Chấp nhận"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 h-8 w-8"
                            onClick={() => handleResponse(req.id, 'declined', req)}
                            title="Từ chối"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}