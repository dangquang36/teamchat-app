"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Plus, Video, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useChannels } from '@/contexts/ChannelContext';
import { CreateChannelModal } from '@/components/modals/hop/CreateChannelModal';

export function ChannelSidebar() {
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const { channels } = useChannels();
    const router = useRouter();

    const handleChannelClick = (channelId: string) => {
        router.push(`/dashboard/kenh/${channelId}`);
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm nay';
        if (diffDays === 2) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays - 1} ngày trước`;

        return date.toLocaleDateString('vi-VN');
    };

    return (
        <>
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Kênh Chat
                        </h2>
                        <Button
                            onClick={() => setIsCreateChannelModalOpen(true)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Tạo kênh
                        </Button>
                    </div>

                    {/* Meeting Section - Pinned to top */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center mb-3">
                            <Video className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                Sẵn sàng cho cuộc họp
                            </h3>
                        </div>
                        <Button
                            onClick={() => router.push('/dashboard/channels')}
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                            Tạo cuộc họp
                        </Button>
                    </div>
                </div>

                {/* Channels List */}
                <div className="flex-1 overflow-y-auto">
                    {channels.length === 0 ? (
                        <div className="p-6 text-center">
                            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Chưa có kênh nào
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Tạo kênh đầu tiên để bắt đầu trò chuyện
                            </p>
                            <Button
                                onClick={() => setIsCreateChannelModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo kênh mới
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    onClick={() => handleChannelClick(channel.id)}
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                                >
                                    <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                                        <AvatarImage
                                            src={channel.image}
                                            alt={channel.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                                            {channel.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                                {channel.name}
                                            </h4>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDate(channel.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {channel.description || 'Không có mô tả'}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {channel.members.length} thành viên
                                            </span>
                                            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {channel.messages.length} tin nhắn
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Channel Modal */}
            <CreateChannelModal
                isOpen={isCreateChannelModalOpen}
                onClose={() => setIsCreateChannelModalOpen(false)}
            />
        </>
    );
} 