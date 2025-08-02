import React, { useState } from 'react';
import { MessageReplyActions } from './MessageReplyActions';
import { ReplyInputPreview } from './ReplyInputPreview';
import { MessageReplyDisplay } from './MessageReplyDisplay';
import { useTheme } from '@/contexts/ThemeContext';

export function ReplyDemo() {
    const [replyTo, setReplyTo] = useState<any>(null);
    const { isDarkMode, toggleDarkMode } = useTheme();

    const mockMessage = {
        id: '1',
        content: 'Đây là một tin nhắn mẫu để test tính năng reply',
        sender: {
            id: 'user1',
            name: 'Nguyễn Văn A',
            avatar: ''
        },
        timestamp: new Date(),
        type: 'text'
    };

    const handleReply = () => {
        setReplyTo({
            id: mockMessage.id,
            from: mockMessage.sender.name,
            text: mockMessage.content,
            type: mockMessage.type
        });
    };

    const handleCancelReply = () => {
        setReplyTo(null);
    };

    const handleCopy = () => {
        console.log('Copy message');
    };

    const handleLike = () => {
        console.log('Like message');
    };

    const handleDelete = () => {
        console.log('Delete message');
    };

    const handleMoreOptions = () => {
        console.log('More options');
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Demo Tính Năng Reply</h2>
                    <button
                        onClick={toggleDarkMode}
                        className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
                    </button>
                </div>

                {/* Demo Message */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Tin nhắn mẫu</h3>

                    <div className="group relative">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {mockMessage.sender.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium">{mockMessage.sender.name}</div>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {mockMessage.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm">{mockMessage.content}</p>
                        </div>

                        {/* Message Actions */}
                        <MessageReplyActions
                            isCurrentUser={false}
                            isDarkMode={isDarkMode}
                            onReply={handleReply}
                            onLike={handleLike}
                            onCopy={handleCopy}
                            onDelete={handleDelete}
                            onMoreOptions={handleMoreOptions}
                            showLike={true}
                            showCopy={true}
                            showDelete={false}
                        />
                    </div>
                </div>

                {/* Reply Preview */}
                {replyTo && (
                    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h3 className="text-lg font-semibold mb-4">Reply Preview</h3>
                        <ReplyInputPreview
                            replyTo={replyTo}
                            onCancel={handleCancelReply}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}

                {/* Reply Display Demo */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Reply Display Demo</h3>

                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <MessageReplyDisplay
                            replyTo={{
                                id: 'reply1',
                                from: 'Nguyễn Văn B',
                                text: 'Tin nhắn được trả lời',
                                type: 'text'
                            }}
                            isDarkMode={isDarkMode}
                            isMyMessage={false}
                        />
                        <p className="text-sm">Đây là tin nhắn trả lời</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
                    <ul className="space-y-2 text-sm">
                        <li>• Hover vào tin nhắn để hiển thị các action buttons</li>
                        <li>• Click vào icon Reply để bắt đầu trả lời</li>
                        <li>• Reply preview sẽ hiển thị trong input area</li>
                        <li>• Click X để hủy reply</li>
                        <li>• Gửi tin nhắn để hoàn thành reply</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 