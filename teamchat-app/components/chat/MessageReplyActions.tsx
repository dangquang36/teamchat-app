import React from 'react';
import { Reply, MoreHorizontal, Heart, Copy, Trash2 } from 'lucide-react';

interface MessageReplyActionsProps {
    isCurrentUser: boolean;
    isDarkMode?: boolean;
    onReply?: () => void;
    onMoreOptions?: () => void;
    onLike?: () => void;
    onCopy?: () => void;
    onDelete?: () => void;
    showLike?: boolean;
    showCopy?: boolean;
    showDelete?: boolean;
}

export function MessageReplyActions({
    isCurrentUser,
    isDarkMode = false,
    onReply,
    onMoreOptions,
    onLike,
    onCopy,
    onDelete,
    showLike = true,
    showCopy = true,
    showDelete = false
}: MessageReplyActionsProps) {
    return (
        <div
            className={`absolute ${isCurrentUser ? 'left-0' : 'right-0'} top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 ${isCurrentUser ? '-translate-x-full -ml-2' : 'translate-x-full ml-2'}`}
            style={{ pointerEvents: 'auto' }}
        >
            {/* Reply Button */}
            <button
                onClick={onReply}
                className={`p-2 rounded-full transition-all duration-200 reply-button ${isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-lg'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-lg'
                    } hover:scale-110 hover:shadow-xl transform`}
                title="Trả lời"
            >
                <Reply className="h-4 w-4 reply-icon-bounce" />
            </button>


            {/* Copy Button */}
            {showCopy && (
                <button
                    onClick={onCopy}
                    className={`p-2 rounded-full transition-all duration-200 ${isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white shadow-lg'
                        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-lg'
                        } hover:scale-110 hover:shadow-xl transform`}
                    title="Sao chép"
                >
                    <Copy className="h-4 w-4" />
                </button>
            )}

        </div>
    );
} 