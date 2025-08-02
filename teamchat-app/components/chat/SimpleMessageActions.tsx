import React from 'react';
import { Reply, MoreHorizontal } from 'lucide-react';

interface SimpleMessageActionsProps {
    isCurrentUser: boolean;
    isDarkMode?: boolean;
    onReply?: () => void;
    onMoreOptions?: () => void;
}

export function SimpleMessageActions({
    isCurrentUser,
    isDarkMode = false,
    onReply,
    onMoreOptions
}: SimpleMessageActionsProps) {
    return (
        <div className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${isCurrentUser ? '-translate-x-full -ml-2' : 'translate-x-full ml-2'}`}>
            {/* Reply Button */}
            <button
                onClick={onReply}
                className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                title="Trả lời"
            >
                <Reply className="h-4 w-4" />
            </button>

            {/* More Options Button */}
            <button
                onClick={onMoreOptions}
                className={`p-1.5 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'} shadow-lg hover:scale-110`}
                title="Thêm tùy chọn"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>
        </div>
    );
} 