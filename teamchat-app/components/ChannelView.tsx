'use client';
import { useState } from 'react';
import { Phone, Video, Download, Paperclip as FileMessageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCall } from './VideoCall';
import { AudioCallModal } from './AudioCallModal';
import { ChannelInput } from './ChannelInput';
import { UserProfileModal, UserProfile } from './UserProfileModal';

interface Group {
    id: string;
    name: string;
    members: number;
}

interface Message {
    id: number;
    sender: UserProfile;
    text?: string;
    files?: { name: string; size: number }[];
}

interface ChannelViewProps {
    channel: Group;
    isDarkMode?: boolean;
}

const otherUser: UserProfile = {
    id: 'user-123',
    name: 'Victoria Lane',
    avatarUrl: '',
    coverPhotoUrl: '',
    gender: 'Nam', birthday: '23/06', phone: '*********', mutualGroups: 11
};

const currentUser: UserProfile = {
    id: 'user-current',
    name: 'Bạn',
    avatarUrl: '',
    coverPhotoUrl: '',
    gender: 'Nam', birthday: '01/01', phone: '*********', mutualGroups: 5
};

export function ChannelView({ channel, isDarkMode = false }: ChannelViewProps) {
    const [isCallingVideo, setIsCallingVideo] = useState(false);
    const [audioCallMode, setAudioCallMode] = useState<'none' | 'outgoing' | 'incoming'>('none');
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: otherUser, text: "Đây là tin nhắn từ người khác." },
        { id: 2, sender: currentUser, text: "Đây là tin nhắn của bạn." }
    ]);

    const userName = "User" + Math.floor(Math.random() * 100);

    // THÊM MỚI: Hàm tạo tin nhắn trả lời tự động
    const generateAutoReply = (userMessage: string): string => {
        return `Đã nhận được tin nhắn: "${userMessage}". Bạn khỏe không?`;
    };

    const handleSendMessage = (data: { text: string; files: File[] }) => {
        const { text, files } = data;
        if (!text.trim() && files.length === 0) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentUser,
            text: text,
            files: files.map(file => ({ name: file.name, size: file.size }))
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);

        // THÊM MỚI: Gửi tin nhắn tự động từ otherUser sau 1 giây
        if (text.trim()) {
            setTimeout(() => {
                const autoReply: Message = {
                    id: Date.now() + 1,
                    sender: otherUser,
                    text: generateAutoReply(text)
                };
                setMessages(prevMessages => [...prevMessages, autoReply]);
            }, 1000); // Đợi 1 giây trước khi gửi tin nhắn trả lời
        }
    };

    const handleViewProfile = (user: UserProfile) => {
        setViewedUser(user);
        setProfileModalOpen(true);
    };

    if (isCallingVideo) {
        return <VideoCall roomName={channel.id} userName={userName} onClose={() => setIsCallingVideo(false)} />;
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                    <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}># {channel.name}</h3>
                    <p className="text-sm text-gray-500">{channel.members} thành viên</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setAudioCallMode('incoming')} variant="outline" size="sm" title="Giả lập nhận cuộc gọi đến"><Download className="h-5 w-5 text-blue-500" /></Button>
                    <Button onClick={() => setIsCallingVideo(true)} variant="ghost" size="sm" title="Thực hiện cuộc gọi video"><Video className="h-5 w-5" /></Button>
                    <Button onClick={() => setAudioCallMode('outgoing')} variant="ghost" size="sm" title="Thực hiện cuộc gọi thoại"><Phone className="h-5 w-5" /></Button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500">Đây là khởi đầu của kênh #{channel.name}.</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
                            <button onClick={() => handleViewProfile(msg.sender)} className="flex-shrink-0">
                                <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-8 h-8 rounded-full cursor-pointer" />
                            </button>
                            <div className={`flex flex-col gap-2 max-w-xs md:max-w-md ${msg.sender.id === currentUser.id ? 'items-end' : 'items-start'}`}>
                                {msg.text && (
                                    <div className={`rounded-lg p-3 ${msg.sender.id === currentUser.id ? 'bg-purple-500 text-white' : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 shadow-sm')}`}>
                                        {msg.text}
                                    </div>
                                )}
                                {msg.files && msg.files.map((file, index) => (
                                    <div key={index} className={`rounded-lg p-3 ${msg.sender.id === currentUser.id ? 'bg-purple-500 text-white' : (isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 shadow-sm')}`}>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-black/10 dark:bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileMessageIcon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{file.name}</p>
                                                <p className="text-xs opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ChannelInput
                channelName={channel.name}
                onSendMessage={handleSendMessage}
                isDarkMode={isDarkMode}
            />

            {audioCallMode !== 'none' && (
                <AudioCallModal channelName={channel.name} onClose={() => setAudioCallMode('none')} mode={audioCallMode} />
            )}

            {isProfileModalOpen && viewedUser && (
                <UserProfileModal
                    user={viewedUser}
                    onClose={() => setProfileModalOpen(false)}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
}