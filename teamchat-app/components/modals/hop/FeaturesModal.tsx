"use client";

import { X, History, MessageSquare } from "lucide-react";

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenHistory: () => void;
    onCreateChannel: () => void;
}

export function FeaturesModal({ isOpen, onClose, onOpenHistory, onCreateChannel }: FeaturesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tính năng
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onOpenHistory();
                            onClose();
                        }}
                        className="w-full flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <History className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Lịch sử cuộc họp
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Xem tất cả cuộc họp đã tạo
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            onCreateChannel();
                            onClose();
                        }}
                        className="w-full flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group"
                    >
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                Tạo kênh chat
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Nhắn tin với thành viên khác
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
} 