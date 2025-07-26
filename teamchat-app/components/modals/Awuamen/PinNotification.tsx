import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Check, X } from 'lucide-react';

interface PinNotificationProps {
    show: boolean;
    isPinned: boolean;
    userName: string;
    isDarkMode?: boolean;
}

export function PinNotification({ show, isPinned, userName, isDarkMode = false }: PinNotificationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.8 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        duration: 0.4
                    }}
                    className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
                >
                    <motion.div
                        initial={{ rotate: -5 }}
                        animate={{ rotate: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className={`
                            relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-lg border
                            ${isDarkMode
                                ? 'bg-gray-800/90 border-gray-700/50 text-white'
                                : 'bg-white/90 border-white/50 text-gray-800'
                            }
                        `}
                        style={{
                            background: isDarkMode
                                ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)'
                        }}
                    >
                        {/* Animated background gradient */}
                        <motion.div
                            className={`absolute inset-0 opacity-20 ${isPinned
                                    ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500'
                                    : 'bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500'
                                }`}
                            animate={{
                                background: isPinned
                                    ? ['linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)',
                                        'linear-gradient(45deg, #f59e0b, #d97706, #fbbf24)',
                                        'linear-gradient(45deg, #fbbf24, #f59e0b, #d97706)']
                                    : ['linear-gradient(45deg, #60a5fa, #a855f7, #3b82f6)',
                                        'linear-gradient(45deg, #a855f7, #3b82f6, #60a5fa)',
                                        'linear-gradient(45deg, #60a5fa, #a855f7, #3b82f6)']
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />

                        <div className="relative px-6 py-4 flex items-center gap-4">
                            {/* Icon with animation */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 20 }}
                                className={`
                                    p-3 rounded-xl shadow-lg
                                    ${isPinned
                                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                        : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                    }
                                `}
                            >
                                {isPinned ? (
                                    <motion.div
                                        animate={{ rotate: [0, 20, -20, 0] }}
                                        transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
                                    >
                                        <Pin className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ delay: 0.5, duration: 0.4, ease: "easeInOut" }}
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Text content with stagger animation */}
                            <div className="flex-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="font-semibold text-sm mb-1"
                                >
                                    {isPinned ? '📌 Đã ghim hội thoại' : '📤 Đã bỏ ghim hội thoại'}
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                    className={`text-xs opacity-80 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                >
                                    {isPinned
                                        ? `${userName} đã được ghim lên đầu danh sách`
                                        : `${userName} đã được bỏ ghim khỏi danh sách`
                                    }
                                </motion.div>
                            </div>

                            {/* Success check animation */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 20 }}
                                className={`
                                    p-2 rounded-full
                                    ${isPinned
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-green-500/20 text-green-500'
                                    }
                                `}
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{
                                        delay: 0.8,
                                        duration: 0.5,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Progress bar */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 2.5, ease: "easeOut" }}
                        />

                        {/* Sparkle effects */}
                        {isPinned && (
                            <>
                                <motion.div
                                    className="absolute top-2 right-2 text-yellow-400 text-xs"
                                    animate={{
                                        scale: [0, 1, 0],
                                        rotate: [0, 180, 360],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        delay: 0.8,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    }}
                                >
                                    ✨
                                </motion.div>
                                <motion.div
                                    className="absolute top-4 left-4 text-yellow-300 text-xs"
                                    animate={{
                                        scale: [0, 1, 0],
                                        rotate: [0, -180, -360],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        delay: 1.2,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    }}
                                >
                                    ⭐
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}