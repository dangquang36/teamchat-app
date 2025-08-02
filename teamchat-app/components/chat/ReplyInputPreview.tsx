import React from 'react';
import { Reply, X, FileText, Image, Video, File } from 'lucide-react';

interface ReplyInputPreviewProps {
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

export function ReplyInputPreview({ replyTo, onCancel, isDarkMode = false }: ReplyInputPreviewProps) {
    const getIcon = () => {
        switch (replyTo.type) {
            case 'image':
                return <Image className="h-4 w-4" />;
            case 'file':
                return <File className="h-4 w-4" />;
            case 'meeting':
                return <Video className="h-4 w-4" />;
            case 'poll':
                return <FileText className="h-4 w-4" />;
            default:
                return <Reply className="h-4 w-4" />;
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
        <div className={`mb-3 p-3 border-l-4 rounded-r-lg transition-all duration-300 animate-in slide-in-from-top-2 reply-preview-fade ${isDarkMode
            ? 'border-purple-500 bg-gray-700/50 backdrop-blur-sm'
            : 'border-purple-500 bg-purple-50/80 backdrop-blur-sm'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        {getIcon()}
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Trả lời {replyTo.from}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getContent()}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                    title="Hủy trả lời"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
} 