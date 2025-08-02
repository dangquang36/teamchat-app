import React from 'react';
import { Reply, X } from 'lucide-react';

interface ReplyPreviewProps {
    replyTo: {
        id: string;
        from: string;
        text?: string;
        content?: string;
        type?: 'text' | 'poll' | 'file' | 'image' | 'meeting' | 'post_notification';
    };
    onCancel: () => void;
    isDarkMode?: boolean;
}

export function ReplyPreview({ replyTo, onCancel, isDarkMode = false }: ReplyPreviewProps) {
    return (
        <div className={`mb-3 p-3 border-l-4 rounded-r-lg ${isDarkMode ? 'border-purple-500 bg-gray-700' : 'border-purple-500 bg-purple-50'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-purple-500" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Trả lời {replyTo.from}
                    </span>
                </div>
                <button
                    onClick={onCancel}
                    className={`p-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className={`mt-1 text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {replyTo.text || replyTo.content || '[Tệp đính kèm]'}
            </div>
        </div>
    );
} 