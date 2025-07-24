import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MuteBannerProps {
    mutedUntil: string;
    onUnmute: () => void;
    isDarkMode?: boolean;
}

export function MuteBanner({ mutedUntil, onUnmute, isDarkMode = false }: MuteBannerProps) {
    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className={`flex items-center justify-between p-3 border-b text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
        >
            <p>
                Tin nhắn trò chuyện này sẽ KHÔNG được thông báo cho đến <strong>{mutedUntil}</strong>
            </p>
            <Button variant="link" onClick={onUnmute} className="text-blue-500 font-semibold">
                Mở lại
            </Button>
        </motion.div>
    );
}