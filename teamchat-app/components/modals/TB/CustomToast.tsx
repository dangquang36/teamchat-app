import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CustomToastProps {
    message: string;
    show: boolean;
}

export function CustomToast({ message, show }: CustomToastProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-gray-900/90 dark:bg-black/80 text-white rounded-full shadow-lg z-50"
                >
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <span className="font-medium">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}