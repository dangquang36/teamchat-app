'use client';
import type React from 'react';

export interface Conversation {
    id: string; name: string; message?: string; unread?: number;
    isOnline?: boolean; avatar?: string; type: 'dm' | 'channel'; members?: number;
}

interface ChatItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
    isDarkMode?: boolean;
}

export function ChatItem({ conversation, isActive, onClick, isDarkMode = false }: ChatItemProps) {
    return (
        <div onClick={onClick} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-purple-100 dark:bg-purple-900/50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
            <div className="relative mr-3 flex-shrink-0">
                <img src={conversation.avatar} alt={conversation.name} className="w-10 h-10 rounded-full" />
                {conversation.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium truncate ${isActive ? "text-purple-600 dark:text-purple-300" : "text-gray-900 dark:text-white"}`}>{conversation.name}</h4>
                    {conversation.unread && conversation.unread > 0 && (<span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2 flex-shrink-0">{conversation.unread}</span>)}
                </div>
                <p className={`text-sm truncate ${conversation.unread ? "font-semibold text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>{conversation.message}</p>
            </div>
        </div>
    );
}