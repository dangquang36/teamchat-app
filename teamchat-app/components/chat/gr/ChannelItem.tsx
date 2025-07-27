import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChannelItemProps {
    name: string;
    members: string;
    avatar?: string;
    time?: string;
    active: boolean;
    onClick: () => void;
    onDelete: () => void;
    isDarkMode?: boolean;
}

export function ChannelItem({
    name,
    members,
    avatar,
    time,
    active,
    onClick,
    onDelete,
    isDarkMode = false,
}: ChannelItemProps) {

    // ✅ THÊM HÀM NÀY VÀO
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện click lan ra div cha
        onDelete(); // Gọi hàm onDelete được truyền từ component cha
    };

    return (
        <div
            // ✅ Thêm class "group" để hiệu ứng hover cho nút xóa hoạt động
            className={`group flex items-center p-3 rounded-lg cursor-pointer transition-colors relative ${active
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
                    <img src={avatar} alt={name} className="w-full h-full rounded-lg object-cover" />
                ) : (
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

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}