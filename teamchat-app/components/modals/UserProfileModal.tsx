import React from "react";
import { Button } from "@/components/ui/button";
import { X, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { UserProfile } from "@/app/types";

interface UserProfileModalProps {
    user: UserProfile;
    onClose: () => void;
    onSendMessage: (userId: string) => void;
    onStartCall: (user: UserProfile) => void;
    isDarkMode?: boolean;
}

export function UserProfileModal({
    user,
    onClose,
    onSendMessage,
    onStartCall,
    isDarkMode = false,
}: UserProfileModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className={`rounded-lg w-full max-w-sm mx-4 overflow-hidden shadow-xl transition-colors ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Phần ảnh bìa và avatar */}
                <div className="relative">
                    <div className="h-28 bg-gradient-to-r from-purple-500 to-indigo-600">
                        {/* Ảnh bìa có thể thêm vào đây */}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className={`w-20 h-20 rounded-full border-4 ${isDarkMode ? "border-gray-800" : "border-white"}`}>
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Tên và các nút hành động */}
                <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    <div className="flex justify-center gap-3 mt-4">
                        {/* NÚT GỌI ĐIỆN */}
                        <Button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1"
                            onClick={() => onStartCall(user)}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Gọi điện
                        </Button>
                        {/* NÚT NHẮN TIN */}
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                            onClick={() => onSendMessage(user.id)}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Nhắn tin
                        </Button>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className={`p-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <h4 className="font-semibold mb-4">Thông tin cá nhân</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Giới tính</span>
                            <span>{user.gender || "Nam"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Ngày sinh</span>
                            <span>{user.dob || "22/06/2004"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Điện thoại</span>
                            <span>{user.phone || "********"}</span>
                        </div>
                    </div>
                </div>

                {/* Các phần khác */}
                <div className={`p-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} text-sm space-y-3`}>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                        <span>Nhóm chung (11)</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                        <span>Chặn tin nhắn và cuộc gọi</span>
                    </div>
                </div>
            </div>
        </div>
    );
}