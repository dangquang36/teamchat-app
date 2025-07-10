import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

export function ChannelDetails({ channel, isDarkMode, onClose }: ChannelDetailsProps) {
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
                    <h3 className="text-sm font-semibold">Tên kênh</h3>
                    <p className="text-sm">{channel.name}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Mô tả</h3>
                    <p className="text-sm">{channel.description}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Thành viên</h3>
                    <p className="text-sm">{channel.members} Thành viên</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Tin nhắn ghim</h3>
                    {channel.pinnedMessages.length > 0 ? (
                        channel.pinnedMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    }`}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{msg.time}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Không có tin nhắn ghim</p>
                    )}
                </div>
            </div>
        </div>
    );
}