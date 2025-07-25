import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contactName: string;
    isDarkMode?: boolean;
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
    isOpen,
    onClose,
    onConfirm,
    contactName,
    isDarkMode = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`rounded-lg p-6 w-96 max-w-md mx-4 shadow-2xl transition-colors duration-300 ${isDarkMode
                                ? 'bg-gray-800 text-white border border-gray-700'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                Xác nhận xóa liên lạc
                            </h3>
                            <motion.button
                                onClick={onClose}
                                className={`p-1 rounded-full transition-colors duration-200 ${isDarkMode
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Bạn có chắc chắn muốn xóa liên lạc <span className="font-semibold">"{contactName}"</span> không?
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className={`px-4 py-2 transition-all duration-200 ${isDarkMode
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                        }`}
                                >
                                    Hủy
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Xác nhận
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};