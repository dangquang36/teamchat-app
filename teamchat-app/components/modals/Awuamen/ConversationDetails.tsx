import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Pin, UserPlus, Clock, Users, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DirectMessage, Message } from '@/app/types';

interface ConversationDetailsProps {
    user: DirectMessage;
    messages: Message[];
    onClose: () => void;
    isDarkMode?: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
    onViewAllMedia: () => void;
    onViewAllFiles: () => void;
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


const InfoSection = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
        <div className="flex items-center">
            <div className="mr-4 text-gray-500 dark:text-gray-400">{icon}</div>
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{title}</p>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
);

// Nhận các props mới đã được khai báo ở trên
export function ConversationDetails({
    user,
    messages,
    onClose,
    isDarkMode = false,
    isMuted,
    onToggleMute,
    onViewAllMedia,
    onViewAllFiles
}: ConversationDetailsProps) {

    // Lọc ra tất cả các file đính kèm từ danh sách tin nhắn
    const allAttachments = messages.flatMap(msg => msg.attachments || []);
    const mediaFiles = allAttachments.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const otherFiles = allAttachments.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));

    return (
        <motion.div
            initial={{ x: '100%', width: 0 }}
            animate={{ x: 0, width: '20rem' }}
            exit={{ x: '100%', width: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`flex-shrink-0 border-l flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}
        >
            <div className="w-80 flex flex-col h-full overflow-hidden">
                <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-semibold">Thông tin hội thoại</h3>
                </div>

                <div className={`flex-1 overflow-y-auto p-4
                                scrollbar-thin 
                                scrollbar-track-transparent 
                                scrollbar-thumb-transparent 
                                hover:scrollbar-thumb-gray-600
                                scrollbar-thumb-rounded-full
                                `}>
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="relative">
                            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mb-3" />
                            {user.online && <div className="absolute bottom-3 right-0 w-4 h-4 bg-green-500 rounded-full border-2 dark:border-gray-800 border-white" />}
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-sm text-green-500 font-medium">{user.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-6">
                        <Button
                            variant="ghost"
                            className="w-full h-auto flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105"
                            onClick={onToggleMute}
                        >
                            {isMuted ? <BellOff className="h-5 w-5 mb-1 text-red-500" /> : <Bell className="h-5 w-5 mb-1" />}
                            <span className={`text-xs ${isMuted ? 'text-red-500' : ''}`}>
                                {isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
                            </span>
                        </Button>
                        <Button variant="ghost" className="w-full h-auto flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105">
                            <Pin className="h-5 w-5 mb-1" />
                            <span className="text-xs">Ghim</span>
                        </Button>
                        <Button variant="ghost" className="w-full h-auto flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105">
                            <UserPlus className="h-5 w-5 mb-1" />
                            <span className="text-xs">Tạo nhóm</span>
                        </Button>
                    </div>

                    <div className="space-y-1">
                        <InfoSection icon={<Clock size={20} />} title="Danh sách nhắc hẹn" />
                        <InfoSection icon={<Users size={20} />} title={`${user.mutualGroups || 0} nhóm chung`} />
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Ảnh</h4>
                            <button
                                onClick={onViewAllMedia}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Xem tất cả
                            </button>
                        </div>
                        {mediaFiles.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {mediaFiles.slice(0, 6).map((file, index) => (
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" key={index}>
                                        <img src={file.url} className="rounded-lg w-full h-20 object-cover" alt={file.name} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-4">Chưa có ảnh nào.</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">File</h4>
                            <button
                                onClick={onViewAllFiles}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Xem tất cả
                            </button>
                        </div>
                        {otherFiles.length > 0 ? (
                            <div className="space-y-2">
                                {otherFiles.slice(0, 5).map((file, index) => (
                                    <a
                                        key={index}
                                        href={file.url}
                                        download={file.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                            <FileText className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{file.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-4">Chưa có file nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
