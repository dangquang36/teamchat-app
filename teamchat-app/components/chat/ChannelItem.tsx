import React from "react";
import { Users } from "lucide-react";

interface ChannelItemProps {
    name: string;
    members: string;
    avatar?: string;
    time?: string;
    active: boolean;
    onClick: () => void;
    isDarkMode?: boolean;
}

export function ChannelItem({
    name,
    members,
    avatar,
    time,
    active,
    onClick,
    isDarkMode = false,
}: ChannelItemProps) {
    return (
        <div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active
                ? isDarkMode
                    ? "bg-purple-900/50"
                    : "bg-purple-50"
                : isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-50"
                }`}
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-lg flex-shrink-0 mr-3">
                {avatar ? (
                    // Nếu có avatar, hiển thị ảnh
                    <img src={avatar} alt={name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                    // Nếu không có, hiển thị chữ cái đầu tiên của tên nhóm
                    <div className={`w-full h-full rounded-lg flex items-center justify-center ${isDarkMode ? "bg-purple-800" : "bg-purple-100"}`}>
                        <span className={`font-bold text-lg ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>
                            {name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4
                        className={`font-medium truncate ${active
                            ? isDarkMode
                                ? "text-purple-400"
                                : "text-purple-600"
                            : isDarkMode
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                    >
                        {name}
                    </h4>
                </div>
                <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {members}
                </p>
            </div>
        </div>
    );
}