'use client';

import { useState } from 'react';
import { X, Phone, MessageSquare, Users, CreditCard, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCallModal } from './modals/VideoCallModal';

// Định nghĩa cấu trúc dữ liệu cho một người dùng
export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
    coverPhotoUrl: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    birthday: string;
    phone: string;
    mutualGroups: number;
}

interface UserProfileModalProps {
    user: UserProfile;
    onClose: () => void;
    isDarkMode?: boolean;
}

export function UserProfileModal({ user, onClose, isDarkMode = false }: UserProfileModalProps) {
    const [isAudioCallOpen, setIsAudioCallOpen] = useState(false); // State to manage AudioCallModal visibility

    const handleOpenAudioCall = () => {
        setIsAudioCallOpen(true);
    };

    const handleCloseAudioCall = () => {
        setIsAudioCallOpen(false);
    };

    return (
        <>
            {/* Lớp nền mờ */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`w-full max-w-sm rounded-lg shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}>
                    {/* Phần Header với ảnh bìa và avatar */}
                    <div className="relative">
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 z-10"
                        >
                            <X size={20} />
                        </button>
                        <img src={user.coverPhotoUrl} alt="Ảnh bìa" className="w-full h-32 object-cover" />
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover" />
                        </div>
                    </div>

                    {/* Tên và các nút hành động */}
                    <div className="pt-16 pb-4 px-6 text-center">
                        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                            {user.name}
                            <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                            </button>
                        </h2>
                        <div className="flex gap-4 mt-4">
                            <Button variant="outline" className="w-full" onClick={handleOpenAudioCall}>
                                <Phone size={16} className="mr-2" /> Gọi Video
                            </Button>
                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                <MessageSquare size={16} className="mr-2" /> Nhắn tin
                            </Button>
                        </div>
                    </div>

                    {/* Các phần thông tin chi tiết */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                            <h3 className="font-semibold mb-3">Thông tin cá nhân</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Giới tính</span>
                                    <span>{user.gender}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Ngày sinh</span>
                                    <span>{user.birthday}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Điện thoại</span>
                                    <span>{user.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AudioCallModal */}
            {isAudioCallOpen && <VideoCallModal onClose={handleCloseAudioCall} />}
        </>
    );
}