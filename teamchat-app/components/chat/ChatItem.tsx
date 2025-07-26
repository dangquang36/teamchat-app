import React from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

interface ChatItemProps {
    name: string;
    message: string;
    avatar: string;
    active: boolean;
    isDarkMode?: boolean;
    onClick: () => void;
    unreadCount?: number;
    isPinned?: boolean;
}

export function ChatItem({
    name,
    message,
    avatar,
    active,
    isDarkMode = false,
    onClick,
    unreadCount = 0,
    isPinned = false
}: ChatItemProps) {
    return (
        <motion.div
            className={`
                relative p-3 rounded-xl cursor-pointer transition-all duration-300 border
                ${active
                    ? isDarkMode
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 shadow-lg'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md'
                    : isDarkMode
                        ? 'hover:bg-gray-700/50 border-transparent hover:border-gray-600/30'
                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                }
                ${isPinned ? 'ring-2 ring-yellow-400/20' : ''}
            `}
            onClick={onClick}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layoutId={`chat-item-${name}`}
        >
            {/* Pin indicator background */}
            {isPinned && (
                <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/5 to-orange-400/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            <div className="flex items-center relative z-10">
                {/* Avatar with pin indicator */}
                <div className="relative flex-shrink-0 mr-3">
                    <motion.img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    />

                    {/* Pin badge on avatar */}
                    {isPinned && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800"
                        >
                            <Pin className="w-2.5 h-2.5 text-white" />
                        </motion.div>
                    )}

                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Chat content */}
                <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center justify-between mb-1">
                        <motion.h3
                            className={`font-semibold text-sm truncate flex items-center gap-2 ${active
                                ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                                : isDarkMode ? 'text-gray-200' : 'text-gray-800'
                                }`}
                            layoutId={`chat-name-${name}`}
                        >
                            {name}
                            {isPinned && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1, duration: 0.2 }}
                                    className="text-yellow-500"
                                >
                                </motion.div>
                            )}
                        </motion.h3>

                        {/* Unread count */}
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <span className="text-white text-xs font-bold px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    <motion.p
                        className={`text-xs truncate ${active
                            ? isDarkMode ? 'text-blue-200/80' : 'text-blue-600/80'
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                        layoutId={`chat-message-${name}`}
                    >
                        {message}
                    </motion.p>
                </div>

                {/* Status indicators */}
                <div className="flex flex-col items-end gap-1">
                    {/* Time or additional status */}
                    <div className={`text-xs ${active
                        ? isDarkMode ? 'text-blue-300/60' : 'text-blue-600/60'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                        {isPinned ? '📌' : ''}
                    </div>
                </div>
            </div>

            {/* Hover glow effect */}
            <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 pointer-events-none"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Active indicator line */}
            {active && (
                <motion.div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full shadow-lg"
                    layoutId="active-indicator"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            )}

            {/* Pin glow effect */}
            {isPinned && (
                <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/5 to-orange-400/5 pointer-events-none"
                    animate={{
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </motion.div>
    );
}