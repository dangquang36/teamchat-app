import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Pin, UserPlus, Clock, Users, ChevronRight, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    isPinned?: boolean; // Thêm prop isPinned
    onTogglePin?: () => void; // Thêm prop onTogglePin
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
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ y: -1 }}
        onClick={onClick}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${isDarkMode
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
                <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
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
    </motion.div>
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
    isPinned = false, // Default value
    onTogglePin // Nhận prop onTogglePin
}: ConversationDetailsProps) {
    // Lọc ra tất cả các file đính kèm từ danh sách tin nhắn
    const allAttachments = messages.flatMap(msg => msg.attachments || []);
    const mediaFiles = allAttachments.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    const otherFiles = allAttachments.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-80 flex-shrink-0 border-l flex flex-col h-full ${isDarkMode
                ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700/50'
                : 'bg-gradient-to-b from-white to-gray-50/50 border-gray-200'
                }`}
        >
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
            <div className={`flex-1 overflow-y-auto ${isDarkMode
                ? 'scrollbar-thin scrollbar-track-gray-800/50 scrollbar-thumb-gray-600/70 hover:scrollbar-thumb-gray-500'
                : 'scrollbar-thin scrollbar-track-gray-100/50 scrollbar-thumb-gray-300/70 hover:scrollbar-thumb-gray-400'
                } scrollbar-thumb-rounded-full`}>

                {/* User Profile Section */}
                <motion.div
                    className="flex flex-col items-center text-center p-6 pb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="relative mb-4">
                        <motion.img
                            src={user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        />
                        {user.online && (
                            <motion.div
                                className={`absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-3 shadow-lg ${isDarkMode ? 'border-gray-800' : 'border-white'
                                    }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                    <motion.h2
                        className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        {user.name}
                    </motion.h2>
                    <motion.div
                        className={`px-4 py-2 rounded-full text-sm font-medium ${user.online
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : isDarkMode
                                ? 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    >
                        {user.online ? '🟢 Đang hoạt động' : '⚫ Ngoại tuyến'}
                    </motion.div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="px-6 pb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="flex flex-col gap-3">
                        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                className={`w-full h-auto flex items-center justify-start gap-4 p-4 rounded-2xl transition-all duration-300 border ${isMuted
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                    : isDarkMode
                                        ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100 border-gray-700/30 hover:border-gray-600/50'
                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={onToggleMute}
                            >
                                <div className={`flex-shrink-0 p-2 rounded-xl ${isMuted
                                    ? 'bg-red-500/20'
                                    : isDarkMode
                                        ? 'bg-gray-600/50'
                                        : 'bg-gray-100'
                                    }`}>
                                    {isMuted ? (
                                        <BellOff className="h-4 w-4" />
                                    ) : (
                                        <Bell className="h-4 w-4" />
                                    )}
                                </div>
                                <span className="text-sm font-medium">
                                    {isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
                                </span>
                            </Button>
                        </motion.div>

                        {/* Pin Button */}
                        {onTogglePin && (
                            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    onClick={onTogglePin}
                                    className={`w-full h-auto flex items-center justify-start gap-4 p-4 rounded-2xl transition-all duration-300 border ${isPinned
                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20'
                                        : isDarkMode
                                            ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100 border-gray-700/30 hover:border-gray-600/50'
                                            : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 p-2 rounded-xl ${isPinned
                                        ? 'bg-yellow-500/20'
                                        : isDarkMode
                                            ? 'bg-gray-600/50'
                                            : 'bg-gray-100'
                                        }`}>
                                        <Pin className={`h-4 w-4 transition-transform duration-200 ${isPinned ? 'rotate-45' : ''}`} />
                                    </div>
                                    <span className="text-sm font-medium">
                                        {isPinned ? 'Bỏ ghim hội thoại' : 'Ghim hội thoại'}
                                    </span>
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Media Section */}
                <motion.div
                    className="px-6 pb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <h4 className={`font-bold text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}>
                                Ảnh & Video
                            </h4>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isDarkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {mediaFiles.length}
                            </span>
                        </div>
                        <motion.button
                            onClick={onViewAllMedia}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors px-3 py-1 rounded-full hover:bg-blue-50/50"
                            whileHover={{ x: 4 }}
                        >
                            Xem tất cả →
                        </motion.button>
                    </div>
                    {mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {mediaFiles.slice(0, 6).map((file, index) => (
                                <motion.a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={index}
                                    className="group block rounded-xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <img
                                        src={file.url}
                                        className="w-full h-20 object-cover group-hover:brightness-110 transition-all duration-300"
                                        alt={file.name}
                                    />
                                </motion.a>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className={`text-center py-8 rounded-2xl border-2 border-dashed ${isDarkMode
                                ? 'text-gray-500 border-gray-700'
                                : 'text-gray-400 border-gray-200'
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                        >
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                📷
                            </div>
                            <p className="text-sm font-medium">Chưa có ảnh nào</p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Files Section */}
                <motion.div
                    className="px-6 pb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <h4 className={`font-bold text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                }`}>
                                Tệp đính kèm
                            </h4>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isDarkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {otherFiles.length}
                            </span>
                        </div>
                        <motion.button
                            onClick={onViewAllFiles}
                            className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors px-3 py-1 rounded-full hover:bg-blue-50/50"
                            whileHover={{ x: 4 }}
                        >
                            Xem tất cả →
                        </motion.button>
                    </div>
                    {otherFiles.length > 0 ? (
                        <div className="space-y-3">
                            {otherFiles.slice(0, 5).map((file, index) => (
                                <motion.a
                                    key={index}
                                    href={file.url}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border ${isDarkMode
                                        ? 'hover:bg-gray-700/30 border-gray-700/30 hover:border-gray-600/50'
                                        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                                        }`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode
                                        ? 'bg-gray-700 group-hover:bg-gray-600'
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                        }`}>
                                        <FileText className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                            }`}>
                                            {file.name}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            {formatFileSize(file.size || 0)}
                                        </p>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                        }`} />
                                </motion.a>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className={`text-center py-8 rounded-2xl border-2 border-dashed ${isDarkMode
                                ? 'text-gray-500 border-gray-700'
                                : 'text-gray-400 border-gray-200'
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                        >
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                📁
                            </div>
                            <p className="text-sm font-medium">Chưa có tệp nào</p>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}