import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal } from "@/components/ui/CreateGroupModal";
import { ChannelView } from "@/components/ChannelView";
import { ChatItem } from "./ChatItem";
import { ChannelItem } from "./ChannelItem";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { Message, DirectMessage, UserProfile } from "@/app/types";

interface MessagesSectionProps {
    onVideoCall: () => void;
    onAudioCall: () => void;
    onCreatePost: () => void;
    isDarkMode?: boolean;
}


export function MessagesSection({
    onVideoCall,
    onAudioCall,
    onCreatePost,
    isDarkMode = false,
}: MessagesSectionProps) {
    const [selectedChat, setSelectedChat] = useState("victoria");
    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const { groups } = useGroups();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const selectedChannel = groups.find(g => g.id === selectedChannelId);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);

    // Đồng bộ dark mode state với localStorage
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);

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
        console.log("Hành động: Nhắn tin cho user ID:", userId);
        setSelectedChatId(userId);
        setSelectedChannelId(null);
        setViewingProfile(null);
    };

    const handleCallFromProfile = (user: UserProfile) => {
        console.log("Hành động: Gọi điện cho user:", user.name);
        setViewingProfile(null);
        onAudioCall();
    };

    const [directMessages, setDirectMessages] = useState<DirectMessage[]>([
        {
            id: "nicholas",
            name: "Nicholas Staten",
            message: "Pleased to meet you again!",
            avatar: "/placeholder.svg?height=40&width=40&text=NS",
            online: true,
        },
        {
            id: "victoria",
            name: "Victoria Lane",
            message: "Hey, I'm going to meet a friend...",
            avatar: "/placeholder.svg?height=40&width=40&text=VL",
            online: true,
        }
    ]);

    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({
        nicholas: [
            { from: "nicholas", text: "Pleased to meet you again!", time: "10:10 am" },
            { from: "me", text: "Me too!", time: "10:11 am" },
        ],
        victoria: [
            { from: "victoria", text: "Hey, I'm going to meet a friend of mine...", time: "10:13 am" },
            { from: "me", text: "Wow that's great!", time: "10:14 am" },
        ]
    });

    const [selectedChatId, setSelectedChatId] = useState("nicholas");
    const selectedChatUser = directMessages.find(dm => dm.id === selectedChatId);
    const currentMessages = allMessages[selectedChatId] || [];

    const handleAddDirectMessage = () => {
        const name = prompt("Nhập tên người bạn muốn nhắn tin:");
        if (name) {
            const newId = name.toLowerCase().replace(/\s/g, "");
            const newUser: DirectMessage = {
                id: newId,
                name: name,
                message: "Bắt đầu cuộc trò chuyện...",
                avatar: `/placeholder.svg?height=40&width=40&text=${name.charAt(0)}`,
                online: false,
            };
            setDirectMessages(prev => [...prev, newUser]);
            setAllMessages(prev => ({ ...prev, [newId]: [] }));
            setSelectedChatId(newId);
        }
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim() || !selectedChatId) return;

        const newMessage: Message = {
            from: "me",
            text: text,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        };

        setAllMessages(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
        }));

        setTimeout(() => {
            const replyMessage: Message = {
                from: selectedChatId,
                text: "Ok, noted!",
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            };
            setAllMessages(prev => ({
                ...prev,
                [selectedChatId]: [...(prev[selectedChatId] || []), replyMessage]
            }));
        }, 1000);
    };

    return (
        <>
            {/* Chat List */}
            <div
                className={`w-80 border-r transition-colors ${currentDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
            >
                <div className={`p-4 border-b transition-colors ${currentDarkMode ? "border-gray-700" : "border-gray-200"
                    }`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className={`text-lg font-semibold flex items-center gap-2 ${currentDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Tin Nhắn
                            <span className="text-sm text-gray-500 font-normal">(128)</span>
                        </h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${currentDarkMode
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto">
                    {/* Direct Messages */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3
                                className={`text-xs font-semibold mb-3 uppercase tracking-wider ${currentDarkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                            >
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
                            {directMessages.map(dm => (
                                <ChatItem
                                    key={dm.id}
                                    name={dm.name}
                                    message={dm.message}
                                    avatar={dm.avatar}
                                    active={selectedChatId === dm.id}
                                    isDarkMode={currentDarkMode}
                                    onClick={() => {
                                        setSelectedChatId(dm.id);
                                        setSelectedChannelId(null);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Channels */}
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3
                                className={`text-xs font-semibold mb-3 uppercase tracking-wider ${currentDarkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                            >
                                KÊNH
                            </h3>
                            <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded-full p-0"
                                onClick={() => setCreateGroupModalOpen(true)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="space-y-1">
                            {groups.map((group) => (
                                <ChannelItem
                                    key={group.id}
                                    name={group.name}
                                    members={`${group.members} Thành viên`}
                                    active={selectedChannelId === group.id}
                                    isDarkMode={currentDarkMode}
                                    onClick={() => {
                                        setSelectedChannelId(group.id);
                                        setSelectedChatId("");
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChannel ? (
                    <ChannelView channel={selectedChannel} isDarkMode={currentDarkMode} />
                ) : selectedChatUser ? (
                    <>
                        <ChatHeader
                            user={selectedChatUser}
                            onVideoCall={onVideoCall}
                            onAudioCall={onAudioCall}
                            isDarkMode={currentDarkMode}
                            onViewProfile={() => setViewingProfile(selectedChatUser)}
                        />
                        <ChatMessages
                            messages={currentMessages}
                            currentUser={selectedChatUser}
                            isDarkMode={currentDarkMode}
                        />
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            isDarkMode={currentDarkMode}
                        />
                    </>
                ) : (
                    <div className={`flex-1 flex items-center justify-center ${currentDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>

            {/* Modal tạo nhóm */}
            {isCreateGroupModalOpen && (
                <CreateGroupModal onClose={() => setCreateGroupModalOpen(false)} />
            )}

            {/* Modal profile */}
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