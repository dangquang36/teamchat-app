'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Phone, MessageSquare, ChevronRight, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
    username?: string;
}

interface UserProfileModalProps {
    user: UserProfile | null;
    onClose: () => void;
    onSendMessage?: (userId: string) => void;
    onStartCall?: (user: UserProfile) => void;
    isDarkMode?: boolean;
}

// Component cho icon mạng xã hội có thể bấm được
const SocialIcon = ({ href, children, isDarkMode }: { href?: string, children: React.ReactNode, isDarkMode?: boolean }) => {
    if (!href) {
        return (
            <Button
                variant="outline"
                size="icon"
                className={`cursor-not-allowed opacity-50 ${isDarkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'
                    }`}
            >
                {children}
            </Button>
        );
    }
    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button
                variant="outline"
                size="icon"
                className={`transition-all duration-200 ${isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-cyan-500 hover:text-cyan-400'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-purple-500 hover:text-purple-600'
                    }`}
            >
                {children}
            </Button>
        </motion.a>
    );
};

export function UserProfileModal({ user, onClose, onSendMessage, onStartCall, isDarkMode = false }: UserProfileModalProps) {
    if (!user) {
        return null;
    }

    // Một hàm trợ giúp nhỏ để render các link media
    const MediaLink = ({ label, icon }: { label: string, icon?: React.ReactNode }) => (
        <motion.a
            href="#"
            className={`flex items-center space-x-1 text-xs hover:underline transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-700 hover:text-purple-600'
                }`}
            whileHover={{ x: 3 }}
        >
            {icon && <span className="w-3 h-3">{icon}</span>}
            <span>{label}</span>
        </motion.a>
    );

    return (
        <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent
                className={`p-0 border-0 max-w-sm w-80 h-auto overflow-hidden shadow-2xl transition-colors duration-300 relative ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    margin: 0
                }}
            >

                {/* --- Phần Header & Avatar --- */}
                <div className="relative">
                    {/* Ảnh bìa */}
                    <div
                        className={`h-24 ${user.coverPhotoUrl
                            ? ''
                            : isDarkMode
                                ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800'
                                : 'bg-gradient-to-br from-purple-500 via-cyan-500 to-blue-600'
                            }`}
                        style={user.coverPhotoUrl ? {
                            backgroundImage: `url(${user.coverPhotoUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        } : {}}
                    />

                    {/* Avatar - Căn giữa tuyệt đối */}
                    <div className="flex justify-center">
                        <motion.div
                            className="relative -mt-8"
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className={`w-16 h-16 rounded-full object-cover border-3 shadow-lg ${isDarkMode ? 'border-gray-800' : 'border-white'
                                    }`}
                            />
                            {user.online && (
                                <motion.div
                                    className={`absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'
                                        }`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* --- Phần Thông tin & Nút hành động --- */}
                <motion.div
                    className="pt-4 pb-6 px-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                    </h2>
                    <p className={`text-sm mb-4 font-medium ${user.online
                        ? 'text-green-500'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {user.online ? '🟢 Đang hoạt động' : '⚫ Ngoại tuyến'}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-6">
                        {user.email && (
                            <div className={`flex items-center justify-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                        )}
                        {user.phone && (
                            <div className={`flex items-center justify-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                <Phone className="h-4 w-4" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                variant="outline"
                                className={`w-full transition-all duration-200 ${isDarkMode
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                                onClick={() => onStartCall && onStartCall(user)}
                            >
                                <Phone className="h-4 w-4 mr-2" />
                                Gọi điện
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                        >
                            <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                onClick={() => onSendMessage && onSendMessage(user.id)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Nhắn tin
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                <hr className={`transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* --- Phần Chi tiết --- */}
                <motion.div
                    className="p-6 space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Nhóm chung */}
                    <motion.a
                        href="#"
                        className={`flex justify-between items-center group transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            } p-3 rounded-lg -mx-3`}
                        whileHover={{ x: 5 }}
                    >
                        <span className={`text-sm font-medium flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                            <span>🏢</span>
                            <span>Nhóm chung ({user.mutualGroups || 0})</span>
                        </span>
                        <ChevronRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                    </motion.a>

                    {/* Social Profiles */}
                    <div>
                        <h3 className={`text-sm font-medium mb-4 flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                            <span>🌐</span>
                            <span>Mạng xã hội</span>
                        </h3>
                        <div className="flex gap-3 justify-center">
                            <SocialIcon href={user.socialProfiles?.facebook} isDarkMode={isDarkMode}>
                                <Facebook className="h-4 w-4" />
                            </SocialIcon>
                            <SocialIcon href={user.socialProfiles?.twitter} isDarkMode={isDarkMode}>
                                <Twitter className="h-4 w-4" />
                            </SocialIcon>
                            <SocialIcon href={user.socialProfiles?.instagram} isDarkMode={isDarkMode}>
                                <Instagram className="h-4 w-4" />
                            </SocialIcon>
                            <SocialIcon href={user.socialProfiles?.linkedin} isDarkMode={isDarkMode}>
                                <Linkedin className="h-4 w-4" />
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Media Details */}
                    <div>
                        <h3 className={`text-sm font-medium mb-4 flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                            <span>📁</span>
                            <span>Media & Files</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <MediaLink label="Photos" icon="📷" />
                            <MediaLink label="Videos" icon="🎥" />
                            <MediaLink label="Links" icon="🔗" />
                            <MediaLink label="Documents" icon="📄" />
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog >
    );
}