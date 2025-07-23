
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Pin, UserPlus, Clock, Users, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DirectMessage } from '@/app/types';

interface ConversationDetailsProps {
    user: DirectMessage;
    onClose: () => void;
    isDarkMode?: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
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


export function ConversationDetails({ user, onClose, isDarkMode = false, isMuted, onToggleMute }: ConversationDetailsProps) {
    const images = Array(6).fill('/placeholder.svg');

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
                        <InfoSection icon={<Users size={20} />} title={`${user.mutualGroups} nhóm chung`} />
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Ảnh/Video</h4>
                            <Button variant="ghost" size="sm" className="text-xs">Xem tất cả</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {images.map((src, index) => (
                                <img key={index} src={`${src}?text=Img${index + 1}`} className="rounded-lg w-full h-20 object-cover" alt={`media-${index}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">File</h4>
                            <Button variant="ghost" size="sm" className="text-xs">Xem tất cả</Button>
                        </div>
                        <p className="text-xs text-gray-400 text-center py-4">Chưa có file nào.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}