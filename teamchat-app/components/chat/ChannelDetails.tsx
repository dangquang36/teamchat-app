'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Users, Pin, FileText } from "lucide-react";

interface Channel {
    id: string;
    name: string;
    members: number;
    description: string;
    pinnedMessages: { text: string; time: string }[];
}

interface ChannelDetailsProps {
    channel: Channel;
    isDarkMode: boolean;
    onClose: () => void;
}

export function ChannelDetails({
    channel,
    isDarkMode,
    onClose
}: ChannelDetailsProps) {
    // Sử dụng client-side navigation
    const [isMounted, setIsMounted] = useState(false);

    // Đảm bảo chỉ render ở client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Đối với những component có sử dụng client-side features,
    // bạn có thể trả về null hoặc loading state trước khi mount
    if (!isMounted) {
        return null; // hoặc return <div>Loading...</div>;
    }

    return (
        <div
            className={`w-80 border-l p-4 transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Thông tin kênh</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Tên kênh
                    </h3>
                    <p className="text-sm ml-6">{channel.name}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Mô tả
                    </h3>
                    <p className="text-sm ml-6">{channel.description}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Thành viên
                    </h3>
                    <p className="text-sm ml-6">{channel.members} Thành viên</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Pin className="h-4 w-4" />
                        Tin nhắn ghim
                    </h3>
                    {channel.pinnedMessages.length > 0 ? (
                        <div className="space-y-2 ml-6">
                            {channel.pinnedMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                        }`}
                                >
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 ml-6">Không có tin nhắn ghim</p>
                    )}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <a
                        href="/dashboard/posts"
                        className="block w-full text-center bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Bài đăng
                    </a>
                </div>
            </div>
        </div>
    );
}