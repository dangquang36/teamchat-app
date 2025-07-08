import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Phone, MessageCircle, X } from "lucide-react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";

interface ProfileSectionProps {
    isDarkMode?: boolean;
}

interface MediaItem {
    id: string;
    type: "image" | "video" | "file";
    src: string;
    alt?: string;
    name?: string;
}

export function ProfileSection({ isDarkMode = false }: ProfileSectionProps) {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    // Sample media items (replace with actual data from API or storage)
    const mediaItems: MediaItem[] = [
        { id: "1", type: "image", src: "/placeholder.svg?height=80&width=80&text=1", alt: "Media 1" },
        { id: "2", type: "image", src: "/placeholder.svg?height=80&width=80&text=2", alt: "Media 2" },
        { id: "3", type: "video", src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
        { id: "4", type: "file", src: "/placeholder.pdf", name: "Document.pdf" },
        { id: "5", type: "image", src: "/placeholder.svg?height=80&width=80&text=3", alt: "Media 3" },
        { id: "6", type: "video", src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4" },
        { id: "7", type: "file", src: "/placeholder.docx", name: "Report.docx" },
        { id: "8", type: "image", src: "/placeholder.svg?height=80&width=80&text=4", alt: "Media 4" },
    ];

    useEffect(() => {
        const userData = localStorage.getItem("currentUser");
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    const renderMediaItem = (item: MediaItem) => {
        switch (item.type) {
            case "image":
                return (
                    <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover rounded-lg"
                    />
                );
            case "video":
                return (
                    <video
                        src={item.src}
                        controls
                        className="w-full h-full object-cover rounded-lg"
                    />
                );
            case "file":
                return (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded-lg p-4">
                        <span className="text-sm font-medium truncate">{item.name}</span>
                        <a
                            href={item.src}
                            download
                            className="text-blue-500 hover:underline text-xs mt-2"
                        >
                            Tải xuống
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full">
            <div
                className={`w-80 border-r transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <div
                    className={`p-4 border-b transition-colors ${isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Hồ Sơ Của Tôi
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={isDarkMode ? "text-gray-400 hover:text-gray-200" : ""}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Profile Header */}
                    <div className="relative mb-6">
                        <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="grid grid-cols-4 gap-2 opacity-30">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 bg-white/20 rounded-lg"
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white">
                                {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8 mb-6">
                        <h3
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            {currentUser?.name || "Admin User"}
                        </h3>
                        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Lập Trình Viên Frontend
                        </p>
                    </div>

                    <div className="mb-6">
                        <p
                            className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                        >
                            Hồ sơ chuyên nghiệp là phần giới thiệu trong CV của bạn, làm nổi bật
                            những kỹ năng và trình độ phù hợp.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center space-x-3">
                            <User
                                className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                    }`}
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                {currentUser?.name || "Admin User"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone
                                className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                    }`}
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                {currentUser?.phone || "Chưa có số điện thoại"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MessageCircle
                                className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                    }`}
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                                {currentUser?.email || "Chưa có email"}
                            </span>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4
                                className={`font-medium uppercase text-sm tracking-wider ${isDarkMode ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                PHƯƠNG TIỆN
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-500 text-sm"
                                onClick={() => setIsMediaModalOpen(true)}
                            >
                                Xem tất cả
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <img
                                src="/placeholder.svg?height=80&width=80&text=1"
                                alt="Media 1"
                                className="rounded-lg aspect-square object-cover"
                            />
                            <img
                                src="/placeholder.svg?height=80&width=80&text=2"
                                alt="Media 2"
                                className="rounded-lg aspect-square object-cover"
                            />
                            <div
                                className={`rounded-lg aspect-square flex items-center justify-center font-medium ${isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                + {mediaItems.length - 2}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat area for profile */}
            <div className="flex-1 flex flex-col">
                <ChatHeader
                    user={{ name: "Profile Chat", online: true, avatar: "/placeholder.svg" }}
                    onVideoCall={() => { }}
                    onAudioCall={() => { }}
                    onViewProfile={() => { }}
                    isDarkMode={isDarkMode}
                />
                <ChatMessages
                    messages={[]}
                    currentUser={{ id: "me", name: "Me", avatar: "/placeholder.svg" }}
                    isDarkMode={isDarkMode}
                />
                <ChatInput onSendMessage={() => { }} isDarkMode={isDarkMode} />
            </div>

            {/* Media Modal */}
            {isMediaModalOpen && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? "bg-black/80" : "bg-black/60"
                        }`}
                >
                    <div
                        className={`relative w-full max-w-4xl h-[80vh] rounded-lg p-6 overflow-y-auto ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                            }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Tất Cả Phương Tiện</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
                                    } absolute top-4 right-4`}
                                onClick={() => setIsMediaModalOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {mediaItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="aspect-square overflow-hidden rounded-lg"
                                >
                                    {renderMediaItem(item)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}