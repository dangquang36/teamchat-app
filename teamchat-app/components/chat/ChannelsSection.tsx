import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal } from "@/components/ui/CreateGroupModal";
import { ChannelView } from "./ChannelView";
import { ChannelItem } from "./ChannelItem";
import { ChannelDetails } from "./ChannelDetails";
import { Message } from "@/lib/src/types";

interface ChannelsSectionProps {
    onCreatePost: () => void;
    isDarkMode?: boolean;
}

export function ChannelsSection({
    onCreatePost,
    isDarkMode = false,
}: ChannelsSectionProps) {
    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const { groups } = useGroups();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [showChannelDetails, setShowChannelDetails] = useState(false);
    const [currentDarkMode, setCurrentDarkMode] = useState(isDarkMode);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});

    const enrichedGroups = groups.map((group) => ({
        ...group,
        description: `This is the ${group.name} channel for team collaboration.`,
        pinnedMessages: [
            { text: "Welcome to the channel!", time: "10:00 AM", pinnedBy: "System" },
        ],
        membersList: [
            { id: "user1", username: "User One", role: "leader" as "leader" | "member" },
            { id: "user2", username: "User Two", role: "member" as "leader" | "member" },
            // Add more members to match the 23 members
            ...Array.from({ length: 21 }, (_, i) => ({
                id: `user${i + 3}`,
                username: `User ${i + 3}`,
                role: "member" as "leader" | "member",
            })),
        ],
        createdBy: "admin",
        createdAt: new Date().toISOString(),
    }));

    const selectedChannel = enrichedGroups.find((g) => g.id === selectedChannelId);

    const filteredChannels = enrichedGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode) {
            setCurrentDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        setCurrentDarkMode(isDarkMode);
    }, [isDarkMode]);

    return (
        <div className={`flex flex-col h-screen ${currentDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            {/* Header with Search */}
            <div className="p-4 border-b flex-shrink-0">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm kênh theo tên..."
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${currentDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900"
                            }`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Tìm kiếm kênh theo tên"
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Channels) */}
                <div className={`w-80 border-r flex flex-col ${currentDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="p-4 border-b flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-xl font-bold flex items-center gap-2 ${currentDarkMode ? "text-white" : "text-gray-900"}`}>
                                Kênh
                            </h2>
                            <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white w-7 h-7 rounded-full p-0 flex items-center justify-center"
                                onClick={() => setCreateGroupModalOpen(true)}
                                aria-label="Tạo kênh mới"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${currentDarkMode ? "text-gray-400" : "text-gray-500"} mb-3`}>
                            TẤT CẢ KÊNH
                        </h3>
                        <div className="space-y-1">
                            {filteredChannels.length > 0 ? (
                                filteredChannels.map((group) => (
                                    <ChannelItem
                                        key={group.id}
                                        name={group.name}
                                        members={`${group.members} Thành viên`}
                                        active={selectedChannelId === group.id}
                                        isDarkMode={currentDarkMode}
                                        onClick={() => {
                                            setSelectedChannelId(group.id);
                                            setShowChannelDetails(true);
                                        }}
                                    />
                                ))
                            ) : (
                                <p className={`text-sm py-2 ${currentDarkMode ? "text-gray-400" : "text-gray-500"}`}>Không tìm thấy kênh nào.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedChannel ? (
                        <ChannelView
                            channel={selectedChannel}
                            isDarkMode={currentDarkMode}
                        />
                    ) : (
                        <div className={`flex-1 flex items-center justify-center text-center p-4 ${currentDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <p className="text-lg">Chọn một kênh từ thanh bên để bắt đầu trò chuyện hoặc tạo một kênh mới!</p>
                        </div>
                    )}
                </div>

                {/* Channel Details Sidebar (Right) */}
                {selectedChannel && showChannelDetails && (
                    <ChannelDetails
                        channel={selectedChannel}
                        isDarkMode={currentDarkMode}
                        onClose={() => setShowChannelDetails(false)}
                        currentUser={{ id: "user1", role: "leader" }}
                    />
                )}
            </div>

            {/* Create Group Modal */}
            {isCreateGroupModalOpen && (
                <CreateGroupModal onClose={() => setCreateGroupModalOpen(false)} />
            )}
        </div>
    );
}