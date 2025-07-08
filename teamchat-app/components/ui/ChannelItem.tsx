'use client';
import type React from 'react';
import type { Conversation } from './ChatItem';

interface ChannelItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    isDarkMode?: boolean;
}

export function ChannelItem({ conversation, isActive, onClick, isDarkMode = false }: ChannelItemProps) {
    return (
        <div onClick={onClick} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-purple-100 dark:bg-purple-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${isDarkMode ? "bg-purple-800" : "bg-purple-100"}`}>
                <span className={`font-semibold text-sm ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>#</span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${isActive ? "text-purple-600 dark:text-purple-300" : "text-gray-900 dark:text-white"}`}>{conversation.name}</h4>
                <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{conversation.members} thành viên</p>
            </div>
        </div>
    );
}