'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X, MessageCircle, Smile, Paperclip, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/components/meeting/MeetingInterface';

interface MeetingChatProps {
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: (message: string) => void;
    onSendMessage: () => void;
    onClose: () => void;
}

export default function MeetingChat({
    messages,
    newMessage,
    setNewMessage,
    onSendMessage,
    onClose
}: MeetingChatProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getParticipantColor = (participantId: string) => {
        const colors = [
            'text-blue-400',
            'text-green-400',
            'text-purple-400',
            'text-pink-400',
            'text-yellow-400',
            'text-indigo-400'
        ];
        const index = participantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    const getParticipantInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const filteredMessages = messages.filter(message =>
        !searchQuery ||
        message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MessageCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Trò chuyện</h3>
                            <p className="text-gray-400 text-xs">
                                {messages.length} tin nhắn
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSearch(!showSearch)}
                            className="text-gray-400 hover:text-white p-2 h-8 w-8"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-2 h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div className="transition-all duration-200">
                        <Input
                            placeholder="Tìm kiếm tin nhắn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 h-8 text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {filteredMessages.length === 0 && !searchQuery ? (
                        <div className="text-center text-gray-400 py-12">
                            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="h-8 w-8 opacity-50" />
                            </div>
                            <p className="font-medium mb-2">Chưa có tin nhắn nào</p>
                            <p className="text-sm opacity-75">Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : filteredMessages.length === 0 && searchQuery ? (
                        <div className="text-center text-gray-400 py-12">
                            <Search className="h-8 w-8 mx-auto mb-4 opacity-50" />
                            <p className="font-medium mb-2">Không tìm thấy tin nhắn</p>
                            <p className="text-sm opacity-75">Thử từ khóa khác</p>
                        </div>
                    ) : (
                        <>
                            {filteredMessages.map((message) => (
                                <div key={message.id} className="group">
                                    <div className="flex items-start space-x-3 hover:bg-slate-700/20 rounded-lg p-2 -m-2 transition-colors">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                                {getParticipantInitials(message.participantName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={`font-medium text-sm ${getParticipantColor(message.participantId)}`}>
                                                    {message.participantName}
                                                </span>
                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {formatTime(message.timestamp)}
                                                </span>
                                                {message.participantName === 'Bạn' && (
                                                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-0">
                                                        Bạn
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="bg-slate-700 rounded-xl px-3 py-2 border border-slate-600">
                                                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                                                    {message.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
                <div className="space-y-3">
                    {/* Quick Reactions */}
                    <div className="flex items-center space-x-2">
                        {['👍', '👏', '😊', '❤️', '🎉'].map((emoji) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-lg hover:bg-slate-700 rounded-full"
                                onClick={() => {
                                    setNewMessage(newMessage + emoji);
                                    inputRef.current?.focus();
                                }}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="flex items-end space-x-2">
                        <div className="flex-1 relative">
                            <Input
                                ref={inputRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pr-10 resize-none min-h-[40px]"
                            />

                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                >
                                    <Smile className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={onSendMessage}
                            disabled={!newMessage.trim()}
                            size="sm"
                            className={`
                                h-10 w-10 p-0 rounded-full transition-all duration-200
                                ${newMessage.trim()
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}