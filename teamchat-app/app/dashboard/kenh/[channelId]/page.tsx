"use client";

import { useState, useEffect, useRef } from 'react';
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
    File as FileIcon,
    Mic,
    BarChart3
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useChannels, ChannelMessage } from '@/contexts/ChannelContext';
import { useSocketContext } from '@/contexts/SocketContext';
import { io as socketIO } from 'socket.io-client';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { InviteMemberModal } from '@/components/modals/hop/InviteMemberModal';
import { ChannelSettingsMenu } from '@/components/chat/channel/ChannelSettingsMenu';
import { CreatePollModal } from '@/components/chat/poll/CreatePollModal';
import { PollResultsModal } from '@/components/chat/poll/PollResultsModal';
import { PollMessage } from '@/components/chat/poll/PollMessage';
import { Poll } from '@/app/types';
import { NotificationService } from '@/services/notificationService';
import { PollService } from '@/services/pollService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/contexts/ThemeContext';
import { useChannelPostNotificationListener } from '@/hooks/useChannelPostNotificationListener';

import { EmojiReactionButton, EmojiReactionsDisplay } from '@/components/chat/EmojiReactionPicker';
import { MessageReplyActions } from '@/components/chat/MessageReplyActions';
import { ReplyInputPreview } from '@/components/chat/ReplyInputPreview';
import { MessageReplyDisplay } from '@/components/chat/MessageReplyDisplay';

interface Member {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
}

// ======================== HELPER COMPONENTS ========================
interface AttachmentMenuItemProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
}

const AttachmentMenuItem = ({ icon, label, onClick, color = "text-cyan-500" }: AttachmentMenuItemProps) => {
    const { isDarkMode } = useTheme();

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-md text-sm transition-all duration-200 ${isDarkMode
                ? "text-gray-300 hover:bg-gray-600 hover:text-white"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
        >
            <span className={color}>{icon}</span>
            {label}
        </button>
    );
};

// ======================== MAIN COMPONENT ========================
export default function ChannelPage() {
    // ======================== HOOKS & CONTEXT ========================
    const params = useParams();
    const router = useRouter();
    const channelId = params.channelId as string;
    const { toast } = useToast();
    const { getChannel, addMessageToChannel, updateChannel, channels, addEmojiReaction } = useChannels();
    const { socket, isConnected } = useSocketContext();
    const currentUser = useCurrentUser();
    const { isDarkMode } = useTheme();

    // Listen for post notifications in channel
    useChannelPostNotificationListener();

    // ======================== STATE MANAGEMENT ========================
    const [channel, setChannel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    // UI State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCreatePollModal, setShowCreatePollModal] = useState(false);
    const [showPollResultsModal, setShowPollResultsModal] = useState(false);

    // File & Media State
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);

    // Poll State
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

    // Emoji Reactions State
    const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<number | null>(null);
    const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

    // Reply State
    const [replyTo, setReplyTo] = useState<{
        id: string;
        from: string;
        text?: string;
        content?: string;
        type?: 'text' | 'poll' | 'file' | 'image' | 'meeting' | 'post_notification';
    } | null>(null);

    // ======================== REFS ========================
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // ======================== UTILITY FUNCTIONS ========================
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ======================== EFFECTS ========================
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
        }
    }, [channels, channelId, getChannel]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [channel?.messages]);

    // Debug socket context on mount
    useEffect(() => {
        console.log('📊 Channel Page: Socket context debug');
        console.log('🔗 Socket from useSocketContext:', {
            exists: !!socket,
            id: socket?.id,
            connected: socket?.connected,
            isConnected: isConnected
        });
        console.log('👤 Current user from hook:', {
            id: currentUser?.id,
            name: currentUser?.name
        });

        // Try to access socket directly from window if available
        if (typeof window !== 'undefined') {
            console.log('🌐 Window object check:', {
                hasSocket: !!(window as any).socket
            });
        }
    }, [socket, isConnected, currentUser]);

    // Handle click outside emoji picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        };
    }, [hideTimeout]);

    // ======================== EVENT HANDLERS ========================
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        try {
            setMessage((prev) => prev + emojiData.emoji);
            setShowEmojiPicker(false);
            console.log('✅ Emoji added:', emojiData.emoji);
        } catch (error) {
            console.error('❌ Error adding emoji:', error);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    // ======================== FILE HANDLING ========================
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            setSelectedFiles(prev => [...prev, ...imageFiles]);
            setShowAttachmentMenu(false);
        }
        event.target.value = '';
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFiles(prev => [...prev, ...Array.from(files)]);
            setShowAttachmentMenu(false);
        }
        event.target.value = '';
    };

    const removeFile = (indexToRemove: number) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // ======================== EMOJI REACTIONS ========================
    const handleEmojiReaction = (messageId: number, emoji: string) => {
        if (currentUser) {
            addEmojiReaction(channelId, messageId, emoji, currentUser.id);
        }
        setEmojiPickerMessageId(null);
    };

    const handleReactionClick = (messageId: number, emoji: string) => {
        if (currentUser) {
            addEmojiReaction(channelId, messageId, emoji, currentUser.id);
        }
    };

    const handleEmojiPickerToggle = (messageId: number) => {
        setEmojiPickerMessageId(emojiPickerMessageId === messageId ? null : messageId);
    };

    const handleEmojiButtonMouseEnter = (messageId: number) => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            setHideTimeout(null);
        }
        setEmojiPickerMessageId(messageId);
    };

    const handleEmojiButtonMouseLeave = () => {
        const timeout = setTimeout(() => {
            setEmojiPickerMessageId(null);
        }, 200); // 200ms delay
        setHideTimeout(timeout);
    };

    // Reply Handlers
    const handleReplyToMessage = (message: any) => {
        setReplyTo({
            id: message.id,
            from: message.sender.name,
            text: message.content,
            content: message.content,
            type: message.type || 'text'
        });

        // Focus on input
        if (inputRef.current) {
            inputRef.current.focus();
        }

        toast({
            title: "Trả lời tin nhắn",
            description: `Đang trả lời tin nhắn của ${message.sender.name}`,
        });
    };

    const handleCancelReply = () => {
        setReplyTo(null);
    };

    const handleCopyMessage = (message: any) => {
        const textToCopy = message.content || message.text || '';
        navigator.clipboard.writeText(textToCopy).then(() => {
            toast({
                title: "Đã sao chép",
                description: "Tin nhắn đã được sao chép vào clipboard",
            });
        });
    };




    // ======================== MESSAGE HANDLING ========================
    const handleSendMessage = async () => {
        if ((!message.trim() && selectedFiles.length === 0) || !channel || !currentUser) return;

        // Clean avatar - only use if it's a real image URL
        const cleanAvatar = currentUser.avatar && currentUser.avatar.trim() !== ''
            ? currentUser.avatar
            : undefined;

        console.log('📝 Sending message with avatar and files:', {
            userId: currentUser.id,
            userName: currentUser.name,
            avatar: cleanAvatar,
            filesCount: selectedFiles.length
        });

        // Handle file uploads
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                try {
                    // Convert file to base64 for simple storage (in production, use proper file upload service)
                    const fileContent = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });

                    const fileType = file.type.startsWith('image/') ? 'image' : 'file';

                    addMessageToChannel(channelId, {
                        content: fileType === 'image' ? `📷 ${file.name}` : `📎 ${file.name}`,
                        sender: {
                            id: currentUser.id,
                            name: currentUser.name,
                            avatar: cleanAvatar
                        },
                        type: fileType as 'image' | 'file',
                        fileData: {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            content: fileContent
                        },
                        replyTo: replyTo ? {
                            id: replyTo.id,
                            from: replyTo.from,
                            content: replyTo.text,
                            type: replyTo.type
                        } : undefined
                    });
                } catch (error) {
                    console.error('Error uploading file:', error);
                    toast({
                        title: "Lỗi upload file",
                        description: `Không thể upload ${file.name}`,
                        variant: "destructive"
                    });
                }
            }
        }

        // Send text message if exists
        if (message.trim()) {
            addMessageToChannel(channelId, {
                content: message.trim(),
                sender: {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: cleanAvatar
                },
                type: 'text',
                replyTo: replyTo ? {
                    id: replyTo.id,
                    from: replyTo.from,
                    content: replyTo.text,
                    type: replyTo.type
                } : undefined
            });
        }

        setMessage('');
        setSelectedFiles([]);
        setReplyTo(null); // Clear reply after sending
    };

    // ======================== CHANNEL MANAGEMENT ========================
    const handleUpdateChannel = (updates: Partial<{ name: string; description: string; image: string }>) => {
        console.log('🔄 handleUpdateChannel called');
        console.log('📊 Updates:', updates);
        console.log('📊 Channel ID:', channelId);

        if (!channel || !currentUser) {
            console.error('❌ Missing channel or currentUser');
            return;
        }

        // Update channel using ChannelContext (includes real-time sync & unified notifications)
        updateChannel(channelId, updates);
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

    // ======================== POLL HANDLING ========================
    const handleCreatePoll = ({ question, options }: { question: string; options: string[] }) => {
        setShowCreatePollModal(true);
    };

    const handleCreatePollSubmit = (pollData: Omit<Poll, "id" | "createdAt" | "totalVoters">) => {
        if (!currentUser || !channel) return;

        console.log(`📊 Creating new poll with PollService`);

        // Create poll using PollService
        const poll = PollService.createPoll(pollData, {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar
        });

        const pollMessage = {
            content: `📊 ${poll.question}`,
            sender: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar
            },
            type: 'poll' as const,
            poll: poll as any
        };

        console.log(`📤 Broadcasting poll message to channel ${channelId}:`, {
            pollId: poll.id,
            question: poll.question,
            optionsCount: poll.options.length
        });

        addMessageToChannel(channelId, pollMessage);
        setShowCreatePollModal(false);

        toast({
            title: "Thành công",
            description: `Đã tạo cuộc bình chọn: "${poll.question}"`,
        });
    };

    const handleVote = async (pollId: string, optionId: string) => {
        if (!currentUser || !channel || !socket) return;

        console.log(`🗳️ Starting vote process: User ${currentUser.name} voting on poll ${pollId}, option ${optionId}`);

        try {
            // Find the poll message
            const pollMessageResult = PollService.findPollMessage(channel.messages, pollId);
            if (!pollMessageResult) {
                console.error(`❌ Poll message not found for poll ${pollId}`);
                return;
            }

            const { message: pollMessage, index: messageIndex } = pollMessageResult;
            const messageId = pollMessage.id;

            console.log(`📊 Found poll message:`, {
                messageId,
                pollQuestion: pollMessage.poll.question,
                pollId
            });

            // Validate poll and option
            if (!PollService.validatePoll(pollMessage.poll) ||
                !PollService.validatePollOption(pollMessage.poll, optionId)) {
                return;
            }

            // Process the vote
            const { updatedPoll, action, optionText } = PollService.processVote(
                pollMessage.poll,
                optionId,
                {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                }
            );

            // Update local state immediately for better UX
            const updatedMessages = PollService.updatePollInMessages(
                channel.messages,
                pollId,
                updatedPoll
            );
            setChannel({ ...channel, messages: updatedMessages });

            // Send poll update to other clients via PollSyncManager
            const updateSuccess = await PollService.sendPollUpdate(
                socket,
                channelId,
                messageId,
                updatedPoll,
                {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                },
                action,
                optionText
            );

            if (updateSuccess) {
                console.log(`✅ Poll vote processed successfully`);
                toast({
                    title: action === 'added' ? "Đã bình chọn" : "Đã bỏ bình chọn",
                    description: `${action === 'added' ? 'Đã vote' : 'Đã bỏ vote'} cho "${optionText}"`,
                });
            } else {
                console.error(`❌ Failed to sync poll update`);
                toast({
                    title: "Lỗi",
                    description: "Không thể đồng bộ bình chọn. Vui lòng thử lại.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error(`❌ Error processing vote:`, error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi bình chọn. Vui lòng thử lại.",
                variant: "destructive"
            });
        }
    };

    const handleViewResults = (poll: Poll) => {
        setSelectedPoll(poll);
        setShowPollResultsModal(true);
    };

    // ======================== LOADING & ERROR STATES ========================
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

    // ======================== RENDER MESSAGE COMPONENT ========================
    const renderMessage = (message: any) => {
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

        // Poll message rendering
        if (message.type === 'poll' && message.poll) {
            return (
                <div
                    key={message.id}
                    className={`flex items-start space-x-2 animate-in slide-in-from-bottom-1 duration-200 ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                >
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        {message.sender.avatar && message.sender.avatar.trim() !== '' && (
                            <AvatarImage
                                src={message.sender.avatar}
                                alt={message.sender.name}
                                onError={(e) => {
                                    console.log('🖼️ Avatar failed to load:', message.sender.avatar);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}
                        <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            {message.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`text-xs text-gray-500 dark:text-gray-400 mb-2 ${isMyMessage ? 'text-right' : ''
                            }`}>
                            <span className="font-medium">
                                {isMyMessage ? 'Bạn' : message.sender.name}
                            </span>
                            <span className="ml-2">
                                {formatTime(message.timestamp)}
                            </span>
                        </div>
                        <PollMessage
                            poll={message.poll as any}
                            currentUserId={currentUser?.id || ''}
                            onVote={handleVote}
                            onViewResults={handleViewResults as any}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
            );
        }

        // Post notification message rendering
        if (message.type === 'post_notification' && message.postData) {
            return (
                <div key={message.id} className="flex items-center justify-center my-4">
                    <div
                        className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 max-w-md w-full border border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all duration-200"
                        onClick={() => router.push(`/dashboard/posts/${message.postData?.postId}`)}
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    {message.postData.authorAvatar && (
                                        <AvatarImage
                                            src={message.postData.authorAvatar}
                                            alt={message.postData.authorName}
                                        />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                        {message.postData.authorName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    📝 Bài đăng mới
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {message.postData.authorName} đã đăng bài
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                {message.postData.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {message.postData.excerpt}
                            </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(new Date(message.postData.createdAt))}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Bấm để xem bài →
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        // Regular text message rendering
        return (
            <div
                key={message.id}
                className={`group flex items-end space-x-2 animate-in slide-in-from-bottom-1 duration-200 ${isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
            >
                <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.sender.avatar && message.sender.avatar.trim() !== '' && (
                        <AvatarImage
                            src={message.sender.avatar}
                            alt={message.sender.name}
                            onError={(e) => {
                                console.log('🖼️ Avatar failed to load:', message.sender.avatar);
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {message.sender.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[70%] relative`}>
                    <div className={`text-xs text-gray-500 dark:text-gray-400 mb-1 ${isMyMessage ? 'text-right' : ''
                        }`}>
                        <span className="font-medium">
                            {isMyMessage ? 'Bạn' : message.sender.name}
                        </span>
                        <span className="ml-2">
                            {formatTime(message.timestamp)}
                        </span>
                    </div>
                    <div className="relative">
                        <div className={`rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md animate-in zoom-in duration-200 relative ${isMyMessage
                            ? isDarkMode
                                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-md'
                                : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-br-md'
                            : isDarkMode
                                ? 'bg-gray-800 text-white border border-gray-700 hover:border-gray-600 rounded-bl-md'
                                : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300 rounded-bl-md'
                            }`}>
                            {message.type === 'image' && message.fileData ? (
                                <div className="overflow-hidden">
                                    <img
                                        src={message.fileData.content}
                                        alt={message.fileData.name}
                                        className="max-w-xs max-h-60 cursor-pointer hover:opacity-90 transition-opacity block rounded-lg object-cover"
                                        onClick={() => window.open(message.fileData?.content, '_blank')}
                                    />
                                    <p className="text-xs mt-1 opacity-75 px-2 pb-1">{message.fileData.name}</p>
                                </div>
                            ) : message.type === 'file' && message.fileData ? (
                                <div className="p-3 flex items-center space-x-3 w-64">
                                    <FileIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{message.fileData.name}</p>
                                        <p className="text-xs opacity-75">{formatFileSize(message.fileData.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = message.fileData?.content || '';
                                            link.download = message.fileData?.name || 'file';
                                            link.click();
                                        }}
                                        className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        Tải xuống
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 max-w-md">
                                    {/* Reply Display */}
                                    {message.replyTo && (
                                        <MessageReplyDisplay
                                            replyTo={message.replyTo}
                                            isDarkMode={isDarkMode}
                                            isMyMessage={Boolean(isMyMessage)}
                                        />
                                    )}
                                    <p className="text-sm leading-relaxed break-words">
                                        {message.content}
                                    </p>
                                </div>
                            )}

                            {/* Emoji Reaction Button - ở góc dưới bên phải */}
                            <div className={`absolute -bottom-2 ${isMyMessage ? '-left-2' : '-right-2'}`}>
                                <EmojiReactionButton
                                    onEmojiPickerToggle={() => handleEmojiPickerToggle(message.id)}
                                    isPickerVisible={!!(emojiPickerMessageId === message.id)}
                                    onReactionSelect={(emoji) => handleEmojiReaction(message.id, emoji)}
                                    isDarkMode={isDarkMode}
                                    isMyMessage={Boolean(isMyMessage)}
                                    onMouseEnter={() => handleEmojiButtonMouseEnter(message.id)}
                                    onMouseLeave={handleEmojiButtonMouseLeave}
                                />
                            </div>
                        </div>

                        {/* Hiển thị reactions hiện có */}
                        {message.reactions && message.reactions.length > 0 && (
                            <EmojiReactionsDisplay
                                reactions={message.reactions}
                                currentUserId={currentUser?.id || ''}
                                onReactionClick={(emoji) => handleReactionClick(message.id, emoji)}
                                isDarkMode={isDarkMode}
                            />
                        )}

                        {/* Message Reply Actions */}
                        <MessageReplyActions
                            isCurrentUser={Boolean(isMyMessage)}
                            isDarkMode={isDarkMode}
                            onReply={() => handleReplyToMessage(message)}
                            onCopy={() => handleCopyMessage(message)}
                            showLike={true}
                            showCopy={true}
                            showDelete={Boolean(isMyMessage)}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // ======================== MAIN RENDER ========================
    return (
        <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {/* Channel Sidebar */}
            <ChannelSidebar />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 shadow-sm`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/dashboard/channels')}
                                className={`mr-2 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    {channel.image && (
                                        <AvatarImage src={channel.image} alt={channel.name} />
                                    )}
                                    <AvatarFallback className={`${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                                        {channel.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
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
                            <Badge variant="secondary" className={`${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                                Hoạt động
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowInviteModal(true)}
                                title="Mời thành viên"
                                className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <UserPlus className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSettingsMenu(true)}
                                title="Cài đặt kênh"
                                className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {channel.messages.length === 0 ? (
                        <div className={`flex items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="text-center">
                                <MessageCircle className={`h-12 w-12 mx-auto mb-4 opacity-50 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chưa có tin nhắn nào</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!</p>
                            </div>
                        </div>
                    ) : (
                        channel.messages.map((message: any) => renderMessage(message))
                    )}
                    {/* Auto-scroll target */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`border-t p-4 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {/* Reply Preview */}
                    {replyTo && (
                        <ReplyInputPreview
                            replyTo={replyTo}
                            onCancel={handleCancelReply}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {/* File Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className={`relative rounded-lg p-2 flex items-center space-x-2 max-w-xs border shadow-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    ) : (
                                        <FileIcon className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className={`text-red-500 hover:text-red-700 p-1 rounded-full ${isDarkMode ? 'hover:bg-red-900' : 'hover:bg-red-100'}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hidden file inputs */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="flex items-end space-x-3 relative">
                        {/* Emoji Picker */}
                        <div ref={emojiPickerRef} className="relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-full mb-2 z-50 shadow-2xl rounded-lg overflow-hidden">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        autoFocusSearch={false}
                                        height={400}
                                        width={350}
                                        theme={Theme.AUTO}
                                        lazyLoadEmojis={true}
                                        previewConfig={{
                                            showPreview: false
                                        }}
                                    />
                                </div>
                            )}

                            {/* Emoji Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Input Field */}
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={replyTo ? `Trả lời ${replyTo.from}...` : "Nhập tin nhắn của bạn..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12 transition-all duration-300 reply-input-focus ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-400"
                                    } ${replyTo ? 'reply-active' : ''}`}
                            />

                            {/* Attachment Menu */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`transition-colors duration-200 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        onClick={() => setShowAttachmentMenu(p => !p)}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>

                                    {showAttachmentMenu && (
                                        <div
                                            onMouseLeave={() => setShowAttachmentMenu(false)}
                                            className={`absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-xl w-48 z-20 ${isDarkMode ? "bg-gray-700 border border-gray-600" : "bg-white border shadow-lg"
                                                }`}
                                        >
                                            <AttachmentMenuItem
                                                icon={<ImageIcon className="h-5 w-5" />}
                                                label="Ảnh"
                                                onClick={() => imageInputRef.current?.click()}
                                                color={isDarkMode ? "text-gray-400" : "text-gray-600"}
                                            />
                                            <AttachmentMenuItem
                                                icon={<FileIcon className="h-5 w-5" />}
                                                label="Tệp"
                                                onClick={() => fileInputRef.current?.click()}
                                                color={isDarkMode ? "text-gray-400" : "text-gray-600"}
                                            />
                                            <AttachmentMenuItem
                                                icon={<BarChart3 className="h-5 w-5" />}
                                                label="Bình luận"
                                                onClick={() => setShowCreatePollModal(true)}
                                                color="text-purple-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleListening}
                            className={`transition-all duration-200 ${isListening
                                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                                : (isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100")
                                }`}
                        >
                            <Mic className="h-5 w-5" />
                        </Button>

                        {/* Send Button */}
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim() && selectedFiles.length === 0}
                            className={`w-12 h-12 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${(!message.trim() && selectedFiles.length === 0) ? 'bg-gray-400 cursor-not-allowed' : isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <InviteMemberModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                channelId={channelId}
                channelName={channel?.name || ''}
            />

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
                currentUser={currentUser || { id: '', name: '' }}
                onUpdateChannel={handleUpdateChannel}
                onRemoveMember={handleRemoveMember}
                onNavigateToPosts={handleNavigateToPosts}
            />

            <CreatePollModal
                isOpen={showCreatePollModal}
                onClose={() => setShowCreatePollModal(false)}
                onCreatePoll={handleCreatePollSubmit as any}
                isDarkMode={isDarkMode}
                currentUser={currentUser || { id: '', name: '' }}
            />

            {selectedPoll && (
                <PollResultsModal
                    isOpen={showPollResultsModal}
                    onClose={() => setShowPollResultsModal(false)}
                    poll={selectedPoll as any}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
}