import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { ChatItem } from "./ChatItem";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { Message, DirectMessage, UserProfile } from "@/lib/src/types";

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

    const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({
        nicholas: [
            { from: "nicholas", text: "Pleased to meet you again!", time: "10:10 am", id: "" },
            { from: "me", text: "Me too!", time: "10:11 am", id: "" },
        ],
        victoria: [
            { from: "victoria", text: "Hey, I'm going to meet a friend of mine...", time: "10:13 am", id: "" },
            { from: "me", text: "Wow that's great!", time: "10:14 am", id: "" },
        ],
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
            from: "me",
            text,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            id: "",
        };

        setAllMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));

        setTimeout(() => {
            const replyMessage: Message = {
                from: selectedChatId,
                text: "Ok, noted!",
                time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
                id: "",
            };
            setAllMessages((prev) => ({
                ...prev,
                [selectedChatId]: [...(prev[selectedChatId] || []), replyMessage],
            }));
        }, 1000);
    };

    return (
        <>
            <div className={`w-80 border-r ${currentDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
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