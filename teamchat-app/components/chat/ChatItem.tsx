

import React from "react";

interface ChatItemProps {
    name: string;
    message: string;
    time?: string;
    avatar: string;
    active: boolean;
    onClick: () => void;
    unreadCount?: number;
    isDarkMode?: boolean;
}

export function ChatItem({
    name, message, time, avatar, active, onClick,
    unreadCount = 0,
    isDarkMode = false,
}: ChatItemProps) {
    return (
        <div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${active ? (isDarkMode ? "bg-purple-900/50" : "bg-purple-50") : (isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50")}`}
            onClick={onClick}
        >
            <div className="relative mr-3">
                <img src={avatar || "/placeholder.svg"} alt={name} className="w-10 h-10 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium truncate ${active ? "text-purple-400" : (isDarkMode ? "text-white" : "text-gray-900")}`}>
                        {name}
                    </h4>
                    {unreadCount > 0 ? (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ml-2 flex-shrink-0">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    ) : (
                        time && <span className="text-xs text-gray-400">{time}</span>
                    )}
                </div>
                <p className={`text-sm truncate ${unreadCount > 0 ? (isDarkMode ? "text-white font-bold" : "text-gray-900 font-bold") : (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>
                    {message}
                </p>
            </div>
        </div>
    );
}