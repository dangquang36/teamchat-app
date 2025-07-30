"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Removed framer-motion - using CSS transitions only
import {
    MessageCircle,
    Users,
    Settings,
    Send,
    Paperclip,
    Smile,
    ArrowLeft,
    UserPlus,
    Video,
    Calendar,
    Clock,
    MoreVertical,
    Image as ImageIcon,
    File as FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useChannels, ChannelMessage } from '@/contexts/ChannelContext';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { InviteMemberModal } from '@/components/modals/hop/InviteMemberModal';
import { ChannelSettingsMenu } from '@/components/chat/channel/ChannelSettingsMenu';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Member {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
}

export default function ChannelPage() {
    const params = useParams();
    const router = useRouter();
    const channelId = params.channelId as string;
    const { toast } = useToast();
    const { getChannel, addMessageToChannel, channels } = useChannels();
    const currentUser = useCurrentUser();

    const [channel, setChannel] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    useEffect(() => {
        // Load channel data from context
        const channelData = getChannel(channelId);
        if (channelData) {
            setChannel(channelData);
            setIsLoading(false);
        } else {
            // Channel not found, redirect to channels page
            toast({
                title: "Lỗi",
                description: "Không tìm thấy kênh này",
                variant: "destructive"
            });
            router.push('/dashboard/channels');
        }
    }, [channelId, getChannel, router, toast]);

    // Update channel data when channels change (for real-time updates)
    useEffect(() => {
        const channelData = getChannel(channelId);
        if (channelData) {
            setChannel(channelData);
            console.log('Channel data updated:', channelData);
        }
    }, [channels, channelId, getChannel]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !channel || !currentUser) return;

        // Add message to channel via context (this will also broadcast via Socket.io)
        addMessageToChannel(channelId, {
            content: newMessage.trim(),
            sender: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar || '/placeholder-user.jpg'
            },
            type: 'text'
        });

        setNewMessage('');
        // Remove toast to make chat more seamless
        // toast({
        //     title: "Tin nhắn đã được gửi",
        //     description: "Tin nhắn của bạn đã được gửi thành công"
        // });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleUpdateChannel = (updates: Partial<{ name: string; description: string; image: string }>) => {
        // TODO: Implement channel update logic
        console.log('Updating channel:', updates);
        toast({
            title: "Kênh đã được cập nhật",
            description: "Thông tin kênh đã được cập nhật thành công"
        });
    };

    const handleRemoveMember = (memberId: string) => {
        // TODO: Implement member removal logic
        console.log('Removing member:', memberId);
        toast({
            title: "Thành viên đã được xóa",
            description: "Thành viên đã được xóa khỏi kênh"
        });
    };

    const handleNavigateToPosts = () => {
        router.push('/dashboard/posts');
        setShowSettingsMenu(false);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center animate-in fade-in duration-300">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Đang tải kênh...</p>
                </div>
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Không tìm thấy kênh
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kênh bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                </div>
            </div>
        );
    }

    // Using CSS animations instead of framer-motion

    return (
        <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Channel Sidebar */}
            <ChannelSidebar />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/dashboard/channels')}
                                className="mr-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={channel.image} alt={channel.name} />
                                    <AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {channel.name}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {channel.members.length} thành viên
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Hoạt động
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowInviteModal(true)}
                                title="Mời thành viên"
                            >
                                <UserPlus className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSettingsMenu(true)}
                                title="Cài đặt kênh"
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {channel.messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">Chưa có tin nhắn nào</p>
                                <p className="text-sm">Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!</p>
                            </div>
                        </div>
                    ) : (
                        channel.messages.map((message: any) => {
                            const isMyMessage = currentUser && message.sender.id === currentUser.id;

                            // Meeting message rendering
                            if (message.type === 'meeting') {
                                return (
                                    <div key={message.id} className="flex items-center justify-center my-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 max-w-md w-full border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                        <Video className="h-5 w-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                        Cuộc họp mới
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {message.content}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {message.meetingData?.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(message.timestamp)} - Bởi {message.sender.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => {
                                                        if (message.meetingData?.joinUrl) {
                                                            window.open(message.meetingData.joinUrl, '_blank');
                                                        }
                                                    }}
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                                    size="sm"
                                                >
                                                    <Video className="h-4 w-4 mr-2" />
                                                    Tham gia
                                                </Button>
                                                <Button variant="outline" size="sm" className="px-3">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Regular text message rendering
                            return (
                                <div
                                    key={message.id}
                                    className={`flex items-end space-x-2 animate-in slide-in-from-bottom-1 duration-200 ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                                        }`}
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                                        <AvatarFallback className="text-xs">{message.sender.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-xs`}>
                                        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isMyMessage ? 'text-right' : ''
                                            }`}>
                                            <span className="font-medium">
                                                {isMyMessage ? 'Bạn' : message.sender.name}
                                            </span>
                                            <span className="ml-2">
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                        <div className={`p-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${isMyMessage
                                            ? 'bg-blue-500 text-white rounded-br-md'
                                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                                            }`}>
                                            <p className="text-sm leading-relaxed break-words">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Message Input */}
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center space-x-3">
                        {/* Emoji Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Smile className="h-5 w-5" />
                        </Button>

                        {/* Input Field */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn của bạn..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition-all duration-300 ${'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                                    }`}
                            />

                            {/* Attachment Menu */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        onClick={() => setShowAttachmentMenu(p => !p)}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>

                                    {showAttachmentMenu && (
                                        <div
                                            onMouseLeave={() => setShowAttachmentMenu(false)}
                                            className="absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-xl w-48 z-20 bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-lg animate-in slide-in-from-bottom-2 duration-200"
                                        >
                                            <div className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md cursor-pointer transition-colors text-green-500">
                                                <ImageIcon className="h-5 w-5 mr-3" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ảnh</span>
                                            </div>
                                            <div className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md cursor-pointer transition-colors text-blue-500">
                                                <FileIcon className="h-5 w-5 mr-3" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Tệp</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Send Button */}
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                channelId={channelId}
                channelName={channel?.name || ''}
            />

            {/* Channel Settings Menu */}
            <ChannelSettingsMenu
                isOpen={showSettingsMenu}
                onClose={() => setShowSettingsMenu(false)}
                channel={{
                    id: channelId,
                    name: channel?.name || '',
                    description: channel?.description || '',
                    image: channel?.image || '',
                    members: channel?.members?.map((member: any) => ({
                        ...member,
                        role: member.role || 'member'
                    })) || []
                }}
                currentUser={currentUser || { id: '', name: '', avatar: '' }}
                onUpdateChannel={handleUpdateChannel}
                onRemoveMember={handleRemoveMember}
                onNavigateToPosts={handleNavigateToPosts}
            />
        </div>
    );
} 