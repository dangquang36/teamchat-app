import React from "react";
import { Button } from "@/components/ui/button";
import { X, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { UserProfile } from "@/app/types";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // Sử dụng react-icons

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
                className={`rounded-lg w-full max-w-lg mx-4 overflow-hidden shadow-xl transition-all duration-500 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <div className="h-28 bg-gradient-to-r from-purple-500 to-indigo-600">
                        {/* Ảnh bìa */}
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className={`w-24 h-24 rounded-full border-4 ${isDarkMode ? "border-gray-800" : "border-white"}`}>
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-2xl font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">{user.phone}</p>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 transition-all duration-300"
                            onClick={() => onStartCall(user)}
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Gọi điện
                        </Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white flex-1 transition-all duration-300"
                            onClick={() => onSendMessage(user.id)}
                        >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Nhắn tin
                        </Button>
                    </div>
                </div>

                <div className={`p-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"} text-sm space-y-4`}>
                    <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                        <span>Nhóm chung (11)</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>

                    {/* Hiển thị các liên kết mạng xã hội dưới dạng icon chưa kết nối */}
                    {user.socialProfiles && (
                        <div className="text-sm text-gray-500 mt-4">
                            <h4 className="font-semibold">Social Profiles</h4>
                            <div className="flex gap-6 mt-2 justify-center">
                                {!user.socialProfiles.facebook && (
                                    <div className="text-gray-400 p-3 rounded-full bg-gray-100">
                                        <FaFacebook className="text-xl" />
                                    </div>
                                )}
                                {!user.socialProfiles.twitter && (
                                    <div className="text-gray-400 p-3 rounded-full bg-gray-100">
                                        <FaTwitter className="text-xl" />
                                    </div>
                                )}
                                {!user.socialProfiles.instagram && (
                                    <div className="text-gray-400 p-3 rounded-full bg-gray-100">
                                        <FaInstagram className="text-xl" />
                                    </div>
                                )}
                                {!user.socialProfiles.linkedin && (
                                    <div className="text-gray-400 p-3 rounded-full bg-gray-100">
                                        <FaLinkedin className="text-xl" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-500 mt-4">
                        <h4 className="font-semibold">Media Details</h4>
                        <div className="space-y-2">
                            <p>Photos</p>
                            <p>Videos</p>
                            <p>Links</p>
                            <p>Documents</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
