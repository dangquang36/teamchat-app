'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Phone, MessageSquare, ChevronRight, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar: string;
    coverPhotoUrl?: string;
    online?: boolean;
    mutualGroups?: number;
    socialProfiles?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
    };
}

interface UserProfileModalProps {
    user: UserProfile | null;
    onClose: () => void;
    onSendMessage?: (userId: string) => void;
    onStartCall?: (user: UserProfile) => void;
}

// Component cho icon mạng xã hội có thể bấm được
const SocialIcon = ({ href, children }: { href?: string, children: React.ReactNode }) => {
    if (!href) {
        return (
            <Button variant="outline" size="icon" className="cursor-not-allowed opacity-50">
                {children}
            </Button>
        );
    }
    return (
        <a href={href} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
                {children}
            </Button>
        </a>
    );
};

export function UserProfileModal({ user, onClose, onSendMessage, onStartCall }: UserProfileModalProps) {
    const { isDarkMode } = useTheme();

    if (!user) {
        return null;
    }

    // Một hàm trợ giúp nhỏ để render các link media
    const MediaLink = ({ label }: { label: string }) => (
        <a href="#" className={`text-sm hover:underline ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
        </a>
    );

    return (
        <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent className={`p-0 border-0 max-w-sm overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>

                {/* --- Phần Header & Avatar --- */}
                <div className="relative">
                    {/* Ảnh bìa */}
                    <div
                        className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600"
                        style={{
                            backgroundImage: `url(${user.coverPhotoUrl || ''})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    {/* Avatar */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2">
                        <img
                            src={user.avatar} // ✅ Đã sửa thành user.avatar
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover border-4 shadow-lg"
                            style={{ borderColor: isDarkMode ? '#1f2937' : 'white' }}
                        />
                    </div>
                </div>

                {/* --- Phần Thông tin & Nút hành động --- */}
                <div className="pt-16 pb-6 px-6 text-center">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h2>
                    {user.email && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>}
                    {user.phone && <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>}

                    <div className="flex gap-4 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onStartCall && onStartCall(user)}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Gọi điện
                        </Button>
                        <Button
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => onSendMessage && onSendMessage(user.id)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Nhắn tin
                        </Button>
                    </div>
                </div>

                <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'} />

                {/* --- Phần Chi tiết --- */}
                <div className="p-6 space-y-6">
                    {/* Nhóm chung */}
                    <a href="#" className="flex justify-between items-center group">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Nhóm chung ({user.mutualGroups || 0})
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </a>

                    {/* Social Profiles */}
                    <div>
                        <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Social Profiles</h3>
                        <div className="flex gap-3">
                            <SocialIcon href={user.socialProfiles?.facebook}><Facebook className="h-4 w-4" /></SocialIcon>
                            <SocialIcon href={user.socialProfiles?.twitter}><Twitter className="h-4 w-4" /></SocialIcon>
                            <SocialIcon href={user.socialProfiles?.instagram}><Instagram className="h-4 w-4" /></SocialIcon>
                            <SocialIcon href={user.socialProfiles?.linkedin}><Linkedin className="h-4 w-4" /></SocialIcon>
                        </div>
                    </div>

                    {/* Media Details */}
                    <div>
                        <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Media Details</h3>
                        <div className="flex flex-col items-start space-y-2">
                            <MediaLink label="Photos" />
                            <MediaLink label="Videos" />
                            <MediaLink label="Links" />
                            <MediaLink label="Documents" />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
