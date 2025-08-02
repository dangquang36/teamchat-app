import React from 'react';
import { Reply, FileText, Image, Video, File } from 'lucide-react';

interface MessageReplyDisplayProps {
    replyTo: {
        id: string;
        from: string;
        text?: string;
        content?: string;
        type?: 'text' | 'poll' | 'file' | 'image' | 'meeting' | 'post_notification';
    };
    isDarkMode?: boolean;
    isMyMessage?: boolean;
}

export function MessageReplyDisplay({ replyTo, isDarkMode = false, isMyMessage = false }: MessageReplyDisplayProps) {
    const getIcon = () => {
        switch (replyTo.type) {
            case 'image':
                return <Image className="h-3 w-3" />;
            case 'file':
                return <File className="h-3 w-3" />;
            case 'meeting':
                return <Video className="h-3 w-3" />;
            case 'poll':
                return <FileText className="h-3 w-3" />;
            default:
                return <Reply className="h-3 w-3" />;
        }
    };

    const getContent = () => {
        if (replyTo.text || replyTo.content) {
            return replyTo.text || replyTo.content;
        }

        switch (replyTo.type) {
            case 'image':
                return '[Hình ảnh]';
            case 'file':
                return '[Tệp đính kèm]';
            case 'meeting':
                return '[Cuộc họp]';
            case 'poll':
                return '[Khảo sát]';
            case 'post_notification':
                return '[Bài đăng]';
            default:
                return '[Tin nhắn]';
        }
    };

    return (
        <div className={`mb-2 p-2 rounded-md text-xs border-l-2 transition-all duration-200 message-reply-display ${isDarkMode
            ? isMyMessage
                ? 'bg-purple-900/30 text-purple-200 border-purple-400'
                : 'bg-gray-700/50 text-gray-300 border-gray-500'
            : isMyMessage
                ? 'bg-purple-50 text-purple-700 border-purple-400'
                : 'bg-gray-100 text-gray-600 border-gray-400'
            }`}>
            <div className="flex items-center gap-1 mb-1">
                {getIcon()}
                <span className="font-medium">Trả lời {replyTo.from}</span>
            </div>
            <div className="truncate opacity-80">
                {getContent()}
            </div>
        </div>
    );
} 