import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal, GroupData } from "@/components/ui/CreateGroupModal";
import { ChannelView } from "./ChannelView";
import { ChannelItem } from "./ChannelItem";
import { ChannelDetails } from "./ChannelDetails";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/components/ui/use-toast";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";


// Define the Message type if not imported from elsewhere
type Message = {
    text: string;
    time: string;
    pinnedBy?: string;
};

interface ChannelsSectionProps {
    onCreatePost: () => void;
}

export function ChannelsSection({ onCreatePost }: ChannelsSectionProps) {
    const { isDarkMode } = useTheme();
    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const { groups, addGroup, deleteGroup } = useGroups();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [showChannelDetails, setShowChannelDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);


    type Group = {
        id: string;
        name: string;
        members: number;
        type: string;
        avatar?: string;
    };

    const [channelToDelete, setChannelToDelete] = useState<Group | null>(null);
    const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});

    const handleDeleteGroup = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (group) {
            setChannelToDelete(group);
            setConfirmDialogOpen(true);
        }
    };

    const confirmDelete = () => {
        if (channelToDelete) {
            deleteGroup(channelToDelete.id);
            // Nếu kênh đang được chọn bị xóa, hãy bỏ chọn nó
            if (selectedChannelId === channelToDelete.id) {
                setSelectedChannelId(null);
            }
            toast({
                title: "Thành công",
                description: `Kênh "${channelToDelete.name}" đã được xóa.`,
            });
        }
        // Đóng dialog và reset state
        setConfirmDialogOpen(false);
        setChannelToDelete(null);
    };


    const handleCreateGroup = (data: GroupData) => {
        console.log("Dữ liệu nhóm mới để gửi lên API:", data);

        const newGroup = {
            id: `group-${Date.now()}`,
            name: data.name,
            description: `This is the ${data.name} channel for team collaboration.`,
            members: 1, // Bắt đầu với 1 thành viên (người tạo)
            type: data.type,
            avatar: data.avatar ? URL.createObjectURL(data.avatar) : undefined // Dùng undefined nếu không có avatar
        };
        addGroup(newGroup);

        setCreateGroupModalOpen(false); // Đóng modal
    };

    const toggleChannelDetails = () => {
        if (!selectedChannelId) return;
        setShowChannelDetails(prev => !prev);
    };

    // Làm giàu dữ liệu group với thông tin giả lập (để render)
    const enrichedGroups = groups.map((group) => ({
        ...group,
        description: `This is the ${group.name} channel for team collaboration.`,
        pinnedMessages: [
            { text: "Welcome to the channel!", time: "10:00 AM", pinnedBy: "System" },
        ],
        membersList: [
            { id: "user1", username: "User One", role: "leader" as const },
            { id: "user2", username: "User Two", role: "member" as const },
            ...Array.from({ length: group.members - 2 > 0 ? group.members - 2 : 0 }, (_, i) => ({
                id: `user${i + 3}`,
                username: `User ${i + 3}`,
                role: "member" as const,
            })),
        ],
        createdBy: "admin",
        createdAt: new Date().toISOString(),
    }));

    const selectedChannel = enrichedGroups.find((g) => g.id === selectedChannelId);

    const filteredChannels = enrichedGroups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return (
        <div className={`flex h-screen ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
            <div className="flex flex-1 overflow-hidden">
                {/* Cột danh sách kênh (bên trái) */}
                <div className={`w-80 border-r flex flex-col ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="p-4 border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
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
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm kênh..."
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-3`}>
                            TẤT CẢ KÊNH
                        </h3>
                        <div className="space-y-1">
                            {filteredChannels.map((group) => (
                                <ChannelItem
                                    key={group.id}
                                    name={group.name}
                                    members={`${group.members} Thành viên`}
                                    avatar={group.avatar}
                                    active={selectedChannelId === group.id}
                                    isDarkMode={isDarkMode}
                                    onClick={() => setSelectedChannelId(group.id)}
                                    onDelete={() => handleDeleteGroup(group.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Khu vực chat chính (ở giữa) */}
                <div className="flex-1 flex flex-col">
                    {selectedChannel ? (
                        <ChannelView
                            channel={selectedChannel}
                            isDarkMode={isDarkMode}
                            onToggleDetails={toggleChannelDetails}
                        />
                    ) : (
                        <div className={`flex-1 flex items-center justify-center text-center p-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <p className="text-lg">Chọn một kênh để bắt đầu!</p>
                        </div>
                    )}
                </div>

                {/* Cột thông tin kênh (bên phải) */}
                <div className={`transition-all duration-300 ease-in-out ${showChannelDetails && selectedChannel ? 'w-80' : 'w-0'}`}>
                    {selectedChannel && (
                        <ChannelDetails
                            channel={selectedChannel}
                            isDarkMode={isDarkMode}
                            onClose={() => setShowChannelDetails(false)}
                            currentUser={{ id: "user1", role: "leader" }}
                        />
                    )}
                </div>
            </div>

            {/* Modal tạo nhóm */}
            {isCreateGroupModalOpen && (
                <CreateGroupModal
                    isOpen={isCreateGroupModalOpen}
                    onClose={() => setCreateGroupModalOpen(false)}
                    onCreateGroup={handleCreateGroup}
                />
            )}

            {channelToDelete && (
                <ConfirmationDialog
                    isOpen={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                    onConfirm={confirmDelete}
                    title="Xác nhận xóa kênh"
                    description={`Bạn có chắc chắn muốn xóa kênh "${channelToDelete.name}" không? Hành động này không thể hoàn tác.`}
                />
            )}
        </div>
    );
}