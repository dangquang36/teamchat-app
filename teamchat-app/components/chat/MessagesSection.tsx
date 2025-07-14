import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Smile } from "lucide-react"; // MODIFIED: Thêm icon Smile
import { ChatItem } from "./ChatItem";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
// MODIFIED: Cập nhật import type
import { Message, DirectMessage, UserProfile, } from "@/lib/src/types";
import { Reaction } from "@/app/types";

// NEW: Component nhỏ cho việc chọn Emoji.
// Để đơn giản, chúng ta sẽ dùng một danh sách có sẵn thay vì một thư viện đầy đủ.
const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
    return (
        <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-lg p-1 flex gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="text-xl p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};


interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    isDarkMode?: boolean;
}

export function MessagesSection({
    onVideoCall,
    onAudioCall,
    isDarkMode = false,
}: MessagesSectionProps) {
    const [selectedChatId, setSelectedChatId] = useState<string>("nicholas");
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setCurrentDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        setCurrentDarkMode(isDarkMode);
    }, [isDarkMode]);

    const handleMessageFromProfile = (userId: string) => {
        setSelectedChatId(userId);
        setViewingProfile(null);
    };

    const handleCallFromProfile = (user: UserProfile) => {
        setViewingProfile(null);
        onAudioCall();
    };
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
        {
            id: "nicholas",
            name: "Nicholas Staten",
            email: "nicholas.staten@example.com",
            message: "Pleased to meet you again!",
            avatar: "/placeholder.svg?height=40&width=40&text=NS",
            online: true,
        },
        {
            id: "victoria",
            name: "Victoria Lane",
            email: "victoria.lane@example.com",
            message: "Hey, I'm going to meet a friend...",
            avatar: "/placeholder.svg?height=40&width=40&text=VL",
            online: true,
        },
    ]);

    // MODIFIED: Cập nhật state tin nhắn với `id` và `reactions`
    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({

    });

    const selectedChatUser = directMessages.find((dm) => dm.id === selectedChatId);
    const filteredDirectMessages = directMessages.filter((dm) =>
        dm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dm.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const currentMessages = allMessages[selectedChatId] || [];

    const handleAddDirectMessage = () => {
        const name = prompt("Nhập tên người bạn muốn nhắn tin:");
        const email = prompt("Nhập email của người bạn muốn nhắn tin:");
        if (name && email) {
            const newId = name.toLowerCase().replace(/\s/g, "");
            const newUser: DirectMessage = {
                id: newId,
                name,
                email,
                message: "Bắt đầu cuộc trò chuyện...",
                avatar: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
                online: false,
            };
            setDirectMessages((prev) => [...prev, newUser]);
            setAllMessages((prev) => ({ ...prev, [newId]: [] }));
            setSelectedChatId(newId);
        }
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim() || !selectedChatId) return;

        const newMessage: Message = {
            // MODIFIED: Thêm id và mảng reactions
            id: `msg-${Date.now()}`,
            from: "me",
            text,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            reactions: [],
        };

        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));

        setTimeout(() => {
            const replyMessage: Message = {
                // MODIFIED: Thêm id và mảng reactions
                id: `msg-${Date.now() + 1}`,
                from: selectedChatId,
                text: "Ok, noted!",
                time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
                reactions: [],
            };
            setAllMessages((prev) => ({
                ...prev,
                [selectedChatId]: [...(prev[selectedChatId] || []), replyMessage],
            }));
        }, 1000);
    };

    // NEW: Hàm để thêm/bớt một cảm xúc
    const handleToggleReaction = (messageId: string, emoji: string) => {
        if (!selectedChatId) return;

        setAllMessages(prev => {
            const chatMessages = prev[selectedChatId];
            const updatedMessages = chatMessages.map(message => {
                if (message.id === messageId) {
                    const existingReactions = message.reactions || [];
                    const myReactionIndex = existingReactions.findIndex(
                        (r: { emoji: string; user: string; }) => r.emoji === emoji && r.user === "me"
                    );

                    let newReactions: Reaction[];

                    if (myReactionIndex > -1) {
                        // Nếu đã thả cảm xúc này -> gỡ bỏ
                        newReactions = existingReactions.filter((_: any, index: any) => index !== myReactionIndex);
                    } else {
                        // Nếu chưa -> thêm vào
                        newReactions = [...existingReactions, { emoji, user: "me" }];
                    }

                    return { ...message, reactions: newReactions };
                }
                return message;
            });

            return {
                ...prev,
                [selectedChatId]: updatedMessages,
            };
        });
    };

    return (
        <>
            <div className={`w-80 border-r ${currentDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                {/* ... Phần sidebar không thay đổi ... */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-lg font-semibold flex items-center gap-2 ${currentDarkMode ? "text-white" : "text-gray-900"}`}>
                            Tin Nhắn
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng hoặc email..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${currentDarkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-xs font-semibold uppercase tracking-wider ${currentDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                TIN NHẮN TRỰC TIẾP
                            </h3>
                            <Button
                                onClick={handleAddDirectMessage}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded-full p-0"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            {filteredDirectMessages.map((dm) => (
                                <ChatItem
                                    key={dm.id}
                                    name={dm.name}
                                    message={dm.message}
                                    avatar={dm.avatar}
                                    active={selectedChatId === dm.id}
                                    isDarkMode={currentDarkMode}
                                    onClick={() => setSelectedChatId(dm.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                {selectedChatUser ? (
                    <>
                        <ChatHeader
                            user={selectedChatUser}
                            onVideoCall={onVideoCall}
                            onAudioCall={onAudioCall}
                            isDarkMode={currentDarkMode}
                            onViewProfile={() => setViewingProfile(selectedChatUser)}
                        />
                        {/* MODIFIED: Truyền hàm xử lý reaction xuống ChatMessages */}
                        <CustomChatMessages
                            messages={currentMessages}
                            currentUser={selectedChatUser}
                            isDarkMode={currentDarkMode}
                            onToggleReaction={handleToggleReaction}
                        />
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            isDarkMode={currentDarkMode}
                        />
                    </>
                ) : (
                    <div className={`flex-1 flex items-center justify-center ${currentDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>
            {viewingProfile && (
                <UserProfileModal
                    user={viewingProfile}
                    onClose={() => setViewingProfile(null)}
                    onSendMessage={handleMessageFromProfile}
                    onStartCall={handleCallFromProfile}
                    isDarkMode={currentDarkMode}
                />
            )}
        </>
    );
}


// NEW: Tạo một component CustomChatMessages để xử lý hiển thị cảm xúc.
// Điều này giúp giữ cho mã gốc của bạn (ChatMessages) không bị thay đổi nếu bạn muốn.
// Hoặc bạn có thể sửa đổi trực tiếp component ChatMessages của mình.

interface CustomChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    isDarkMode: boolean;
    onToggleReaction: (messageId: string, emoji: string) => void;
}

const CustomChatMessages: React.FC<CustomChatMessagesProps> = ({ messages, currentUser, isDarkMode, onToggleReaction }) => {
    const [activePicker, setActivePicker] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleReactionSelect = (messageId: string, emoji: string) => {
        onToggleReaction(messageId, emoji);
        setActivePicker(null);
    };

    return (
        <div className={`flex-1 overflow-y-auto p-6 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <div className="space-y-6">
                {messages.map((message) => {
                    const isMe = message.from === "me";
                    const alignment = isMe ? "items-end" : "items-start";
                    const bgColor = isMe
                        ? (isDarkMode ? "bg-purple-800" : "bg-purple-500")
                        : (isDarkMode ? "bg-gray-700" : "bg-white");
                    const textColor = isMe
                        ? "text-white"
                        : (isDarkMode ? "text-gray-200" : "text-gray-800");
                    const messageBorderRadius = isMe ? "rounded-br-none" : "rounded-bl-none";

                    return (
                        <div key={message.id} className={`flex flex-col ${alignment}`}>
                            <div className={`group relative max-w-xs lg:max-w-md p-3 rounded-lg ${bgColor} ${textColor} ${messageBorderRadius} shadow-md`}>
                                <p className="text-sm">{message.text}</p>
                                <span className={`text-xs mt-1 ${isMe ? "text-purple-200" : (isDarkMode ? "text-gray-400" : "text-gray-500")}`}>
                                    {message.time}
                                </span>

                                {/* NEW: Nút để mở trình chọn emoji */}
                                <div className={`absolute top-0 transform -translate-y-1/2 ${isMe ? 'left-[-1rem]' : 'right-[-1rem]'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    {activePicker === message.id && (
                                        <EmojiPicker onSelect={(emoji) => handleReactionSelect(message.id, emoji)} />
                                    )}
                                    <button onClick={() => setActivePicker(activePicker === message.id ? null : message.id)} className="bg-white dark:bg-gray-600 rounded-full p-1 shadow">
                                        <Smile className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                                    </button>
                                </div>

                                {/* NEW: Hiển thị các cảm xúc đã có */}
                                {message.reactions && message.reactions.length > 0 && (
                                    <div className="absolute bottom-[-1rem] left-2 flex items-center gap-1 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-full px-2 py-0.5 text-xs shadow">
                                        {message.reactions.map((r: { emoji: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, index: React.Key | null | undefined) => (
                                            <span key={index}>{r.emoji}</span>
                                        ))}
                                        <span className="ml-1 font-semibold text-gray-700 dark:text-gray-200">{message.reactions.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};