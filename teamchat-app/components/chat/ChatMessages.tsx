import React from "react";
import { ChatMessagesProps } from "@/app/types";

export function ChatMessages({
    messages,
    currentUser,
    isDarkMode = false,
}: ChatMessagesProps) {
    return (
        <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
                }`}
        >
            {messages.map((msg, index) => {
                const isMyMessage = msg.from === "me";

                if (isMyMessage) {
                    return (
                        <div key={index} className="flex justify-end">
                            <div className="bg-purple-500 text-white rounded-lg px-4 py-2 max-w-md">
                                <p>{msg.text}</p>
                                <div className="text-xs opacity-75 mt-1 text-right">
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={index} className="flex items-start space-x-3">
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span
                                        className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {currentUser.name}
                                    </span>
                                    <span
                                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                            }`}
                                    >
                                        {msg.time}
                                    </span>
                                </div>
                                <div
                                    className={`rounded-lg p-3 shadow-sm ${isDarkMode
                                            ? "bg-gray-800 text-white"
                                            : "bg-white text-gray-800"
                                        }`}
                                >
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
}