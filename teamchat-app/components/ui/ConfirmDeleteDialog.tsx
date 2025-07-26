import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    contactName: string;
    isDarkMode?: boolean; // Optional override
}

export const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
    isOpen,
    onClose,
    onConfirm,
    contactName,
    isDarkMode
}) => {
    // Fallback: kiểm tra DOM nếu context không hoạt động
    const [detectedDark, setDetectedDark] = React.useState(false);

    React.useEffect(() => {
        if (isDarkMode === undefined) {
            const checkDarkMode = () => {
                return document.documentElement.classList.contains('dark') ||
                    document.body.classList.contains('dark') ||
                    document.documentElement.getAttribute('data-theme') === 'dark';
            };
            setDetectedDark(checkDarkMode());

            // Theo dõi thay đổi theme
            const observer = new MutationObserver(() => {
                setDetectedDark(checkDarkMode());
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class', 'data-theme']
            });

            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });

            return () => observer.disconnect();
        }
    }, [isDarkMode]);

    // Sử dụng prop nếu có, nếu không thì dùng detected value
    const isInDarkMode = isDarkMode !== undefined ? isDarkMode : detectedDark;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`rounded-xl p-6 w-96 max-w-md mx-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${isInDarkMode
                                ? 'bg-gray-800/95 text-white border border-gray-600/50 shadow-black/50'
                                : 'bg-white/95 text-gray-900 border border-gray-200/50 shadow-gray-900/20'
                            }`}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-semibold ${isInDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                Xác nhận xóa liên lạc
                            </h3>
                            <motion.button
                                onClick={onClose}
                                className={`p-2 rounded-full transition-all duration-200 ${isInDarkMode
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/80'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div className={`mb-8 leading-relaxed text-base ${isInDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                            <p className="mb-2">
                                Bạn có chắc chắn muốn xóa liên lạc{' '}
                                <span className={`font-semibold ${isInDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    "{contactName}"
                                </span>{' '}
                                không?
                            </p>
                            <p className={`text-sm ${isInDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className={`px-6 py-2.5 font-medium transition-all duration-200 ${isInDarkMode
                                            ? 'border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-600 hover:text-white hover:border-gray-500'
                                            : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400'
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
                                    className={`px-6 py-2.5 font-medium transition-all duration-200 ${isInDarkMode
                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-900/50'
                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-600/30'
                                        }`}
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