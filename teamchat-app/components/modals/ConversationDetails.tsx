import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Pin, UserPlus, Clock, Users } from 'lucide-react';
import type { DirectMessage } from '@/app/types';

interface ConversationDetailsProps {
    user: DirectMessage;
    onClose: () => void;
    isDarkMode?: boolean;
}

const InfoSection = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle?: string }) => (
    <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
        <div className="mr-4 text-gray-500 dark:text-gray-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-800 dark:text-gray-200">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
    </div>
);

export function ConversationDetails({ user, onClose, isDarkMode = false }: ConversationDetailsProps) {
    const images = Array(6).fill('/placeholder.svg');

    return (
        <div className={`w-80 h-full border-l flex-shrink-0 flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className="font-semibold">Thông tin hội thoại</h3>

            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col items-center text-center mb-6">
                    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mb-3" />
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-6">
                    <div>
                        <Button variant="ghost" className="w-full h-auto flex flex-col items-center p-2">
                            <Bell className="h-5 w-5 mb-1" />
                            <span className="text-xs">Tắt thông báo</span>
                        </Button>
                    </div>
                    <div>
                        <Button variant="ghost" className="w-full h-auto flex flex-col items-center p-2">
                            <Pin className="h-5 w-5 mb-1" />
                            <span className="text-xs">Ghim</span>
                        </Button>
                    </div>
                    <div>
                        <Button variant="ghost" className="w-full h-auto flex flex-col items-center p-2">
                            <UserPlus className="h-5 w-5 mb-1" />
                            <span className="text-xs">Tạo nhóm</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <InfoSection icon={<Clock size={20} />} title="Danh sách nhắc hẹn" />
                    <InfoSection icon={<Users size={20} />} title={`${user.mutualGroups} nhóm chung`} />
                </div>

                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-sm">Ảnh/Video</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((src, index) => (
                            <img key={index} src={`${src}?text=Img${index + 1}`} className="rounded-md w-full h-20 object-cover" alt={`media-${index}`} />
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-2">Xem tất cả</Button>
                </div>

                <div className="mt-6">
                    <h4 className="font-semibold mb-2 text-sm">File</h4>
                    <p className="text-xs text-gray-400">Chưa có file nào.</p>
                </div>
            </div>
        </div>
    );
}