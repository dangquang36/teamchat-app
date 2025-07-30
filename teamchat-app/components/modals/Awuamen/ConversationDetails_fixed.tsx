import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Pin, UserPlus, Clock, Users, ChevronRight, FileText, X } from 'lucide-react';
// Removed framer-motion - using CSS transitions only
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
    isPinned?: boolean;
    onTogglePin?: () => void;
}

const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const InfoSection = ({
    icon,
    title,
    subtitle,
    isDarkMode,
    onClick
}: {
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    isDarkMode?: boolean,
    onClick?: () => void
}) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover-lift animate-in slide-in-from-bottom-1 duration-200 ${isDarkMode
            ? 'hover:bg-gray-700/40 text-gray-200 border border-gray-700/50'
            : 'hover:bg-gray-50 text-gray-800 border border-gray-200/50'
            }`}
    >
        <div className="flex items-center">
            <div className={`mr-4 p-2 rounded-lg ${isDarkMode
                ? 'bg-gray-700/50 text-blue-400'
                : 'bg-blue-50 text-blue-600'
                }`}>
                {icon}
            </div>
            <div>
                <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {title}
                </p>
                {subtitle && (
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
        <ChevronRight className={`h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
    </div>
);

export function ConversationDetails({
    user,
    messages,
    onClose,
    isDarkMode = false,
    isMuted,
    onToggleMute,
    onViewAllMedia,
    onViewAllFiles,
    isPinned = false,
    onTogglePin
}: ConversationDetailsProps) {
    // Lọc ra tất cả các file đính kèm từ danh sách tin nhắn
    const allAttachments = messages.flatMap(msg => msg.attachments || []);
    const mediaFiles = allAttachments.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const otherFiles = allAttachments.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));

    return (
        <div className={`w-full flex flex-col h-full ${isDarkMode
            ? 'bg-gradient-to-b from-gray-800 to-gray-900'
            : 'bg-gradient-to-b from-white to-gray-50/50'
            }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between flex-shrink-0 backdrop-blur-sm ${isDarkMode
                ? 'border-gray-700/50 bg-gray-800/90'
                : 'border-gray-200 bg-white/90'
                }`}>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                    Thông tin hội thoại
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={`rounded-full p-2 h-8 w-8 transition-all duration-200 ${isDarkMode
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* User Info */}
                <div className="px-6 py-6 text-center animate-in slide-in-from-bottom-1 duration-200">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 shadow-xl border-4 border-white dark:border-gray-700 object-cover animate-in zoom-in duration-200"
                    />
                    <div className="relative inline-block animate-in zoom-in duration-200">
                        <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 absolute -bottom-1 -right-1 ${user.online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                    </div>
                    <h2 className={`text-xl font-bold mb-1 animate-in fade-in duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                        {user.name}
                    </h2>
                    <div className={`text-sm flex items-center justify-center gap-1 animate-in zoom-in duration-200 ${user.online
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {user.online ? 'Ngoại tuyến' : 'Ngoại tuyến'}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="px-6 pb-6 animate-in slide-in-from-bottom-1 duration-200">
                    <div className="hover-lift transition-transform">
                        <InfoSection
                            icon={isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                            title={isMuted ? "Bật thông báo" : "Tắt thông báo"}
                            isDarkMode={isDarkMode}
                            onClick={onToggleMute}
                        />
                    </div>

                    <div className="mt-3 hover-lift transition-transform">
                        <InfoSection
                            icon={isPinned ? <Pin className="h-4 w-4 text-yellow-500" /> : <Pin className="h-4 w-4" />}
                            title={isPinned ? "Bỏ ghim hội thoại" : "Ghim hội thoại"}
                            isDarkMode={isDarkMode}
                            onClick={onTogglePin}
                        />
                    </div>
                </div>

                {/* Media & Files Section */}
                <div className="px-6 pb-6 animate-in slide-in-from-bottom-1 duration-200">
                    <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                        Ảnh & Video
                        <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {mediaFiles.length}
                        </span>
                        <button
                            onClick={onViewAllMedia}
                            className="float-right text-blue-500 hover:text-blue-600 text-sm font-medium hover:translate-x-1 transition-transform"
                        >
                            Xem tất cả →
                        </button>
                    </h4>

                    {mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 animate-in zoom-in duration-200">
                            {mediaFiles.slice(0, 6).map((file, index) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="animate-in zoom-in duration-200 hover-scale transition-transform"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={file.url}
                                            alt={file.name}
                                            className="w-full h-16 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                        />
                                    ) : (
                                        <div className={`w-full h-16 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}>
                                            <FileText className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-8 rounded-lg animate-in fade-in duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                            }`}>
                            <FileText className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                }`} />
                            <p className="text-sm font-medium">Chưa có ảnh nào</p>
                        </div>
                    )}
                </div>

                {/* Files Section */}
                <div className="px-6 pb-6 animate-in slide-in-from-bottom-1 duration-200">
                    <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                        Tệp đính kèm
                        <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {otherFiles.length}
                        </span>
                        <button
                            onClick={onViewAllFiles}
                            className="float-right text-blue-500 hover:text-blue-600 text-sm font-medium hover:translate-x-1 transition-transform"
                        >
                            Xem tất cả →
                        </button>
                    </h4>

                    {otherFiles.length > 0 ? (
                        <div className="space-y-2">
                            {otherFiles.slice(0, 5).map((file, index) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="animate-in slide-in-from-left duration-200 hover:translate-x-1 transition-transform"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`flex items-center p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${isDarkMode
                                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}>
                                            <FileText className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                                }`}>
                                                {file.name}
                                            </p>
                                            {file.size && (
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    {formatFileSize(file.size)}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                            }`} />
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-8 rounded-lg animate-in fade-in duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                            }`}>
                            <FileText className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                }`} />
                            <p className="text-sm font-medium">Chưa có tệp nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}