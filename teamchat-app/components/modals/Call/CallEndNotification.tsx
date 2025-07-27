import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Clock, User, X } from 'lucide-react';

interface CallEndNotificationProps {
    callEndReason: string | null;
    callerName?: string;
    callDuration?: string;
    isVisible: boolean;
    onDismiss: () => void;
    isDarkMode?: boolean;
}

export const CallEndNotification: React.FC<CallEndNotificationProps> = ({
    callEndReason,
    callerName,
    callDuration,
    isVisible,
    onDismiss,
    isDarkMode = false
}) => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        if (isVisible && callEndReason) {
            setShouldShow(true);
            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                setShouldShow(false);
                setTimeout(onDismiss, 300); // Wait for animation to complete
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, callEndReason, onDismiss]);

    const getIcon = () => {
        if (callEndReason?.includes('từ chối') || callEndReason?.includes('bận')) {
            return <PhoneOff className="w-6 h-6 text-red-400" />;
        }
        return <Phone className="w-6 h-6 text-blue-400" />;
    };

    const getNotificationColor = () => {
        if (callEndReason?.includes('từ chối') || callEndReason?.includes('bận')) {
            return 'from-red-500 to-red-600';
        }
        if (callEndReason?.includes('thành công') || callEndReason?.includes('kết thúc')) {
            return 'from-green-500 to-green-600';
        }
        return 'from-blue-500 to-purple-600';
    };

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.9 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                    }}
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-sm w-full mx-4"
                >
                    <div className={`rounded-xl shadow-2xl backdrop-blur-md border overflow-hidden ${isDarkMode
                            ? 'bg-gray-800/95 border-gray-700/50'
                            : 'bg-white/95 border-gray-200/50'
                        }`}>
                        {/* Header gradient */}
                        <div className={`h-1 bg-gradient-to-r ${getNotificationColor()}`} />

                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {/* Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            delay: 0.2,
                                            type: "spring",
                                            stiffness: 400
                                        }}
                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}
                                    >
                                        {getIcon()}
                                    </motion.div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <motion.h4
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}
                                        >
                                            Cuộc gọi đã kết thúc
                                        </motion.h4>

                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                                }`}
                                        >
                                            {callEndReason}
                                        </motion.p>

                                        {/* Additional info */}
                                        <div className="flex items-center space-x-4 mt-2">
                                            {callerName && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <User className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`} />
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {callerName}
                                                    </span>
                                                </motion.div>
                                            )}

                                            {callDuration && callDuration !== '00:00' && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.6 }}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`} />
                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {callDuration}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Close button */}
                                <motion.button
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={() => {
                                        setShouldShow(false);
                                        setTimeout(onDismiss, 300);
                                    }}
                                    className={`flex-shrink-0 p-1 rounded-full transition-colors ${isDarkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Progress bar for auto-dismiss */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{
                                    duration: 5,
                                    ease: "linear"
                                }}
                                className={`h-0.5 mt-3 bg-gradient-to-r ${getNotificationColor()} rounded-full`}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};