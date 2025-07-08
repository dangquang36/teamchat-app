import React from "react";

interface ChannelItemProps {
    name: string;
    members: string;
    time?: string;
    active: boolean;
    onClick: () => void;
    isDarkMode?: boolean;
}

export function ChannelItem({
    name,
    members,
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
            <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? "bg-purple-800" : "bg-purple-100"
                    }`}
            >
                <span
                    className={`font-semibold text-sm ${isDarkMode ? "text-purple-300" : "text-purple-600"
                        }`}
                >
                    #
                </span>
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
                    {time && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                            {time}
                        </span>
                    )}
                </div>
                <p
                    className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                >
                    {members}
                </p>
            </div>
        </div>
    );
}