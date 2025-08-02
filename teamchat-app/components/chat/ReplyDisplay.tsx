import React from 'react';
import { Reply } from 'lucide-react';

interface ReplyDisplayProps {
    replyTo: {
        id: string;
        from: string;
        text?: string;
        content?: string;
        type?: 'text' | 'poll' | 'file' | 'image' | 'meeting' | 'post_notification';
    };
    isDarkMode?: boolean;
}

export function ReplyDisplay({ replyTo, isDarkMode = false }: ReplyDisplayProps) {
    return (
        <div className={`mb-2 p-2 rounded-md text-xs ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            <div className="flex items-center gap-1 mb-1">
                <Reply className="h-3 w-3" />
                <span className="font-medium">Trả lời {replyTo.from}</span>
            </div>
            <div className="truncate">
                {replyTo.text || replyTo.content || '[Tệp đính kèm]'}
            </div>
        </div>
    );
} 