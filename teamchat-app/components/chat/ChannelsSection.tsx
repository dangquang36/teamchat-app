import React, { useState } from "react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal, GroupData } from "@/components/ui/CreateGroupModal";
import { ChannelView } from "./ChannelView";
import { ChannelDetails } from "./ChannelDetails";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/components/ui/use-toast";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { ChannelList } from "./ChannelList";

// Giả định các type cần thiết
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
    const { groups, addGroup, deleteGroup } = useGroups();

    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [showChannelDetails, setShowChannelDetails] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [channelToDelete, setChannelToDelete] = useState<any | null>(null);

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
            if (selectedChannelId === channelToDelete.id) {
                setSelectedChannelId(null);
            }
            toast({
                title: "Thành công",
                description: `Kênh "${channelToDelete.name}" đã được xóa.`,
            });
        }
        setConfirmDialogOpen(false);
        setChannelToDelete(null);
    };

    const handleCreateGroup = (data: GroupData) => {
        const newGroup = {
            id: `group-${Date.now()}`,
            name: data.name,
            description: `Đây là kênh ${data.name}.`,
            members: 1,
            type: data.type,
            avatar: data.avatar ? URL.createObjectURL(data.avatar) : undefined,
        };
        addGroup(newGroup);
        setCreateGroupModalOpen(false);
    };

    const toggleChannelDetails = () => {
        if (!selectedChannelId) return;
        setShowChannelDetails(prev => !prev);
    };

    const enrichedGroups = groups.map((group) => ({
        ...group,
        description: group.description || `Đây là kênh ${group.name}.`,
        pinnedMessages: [],
        membersList: Array.from({ length: group.members }, (_, i) => ({
            id: `user${i + 1}`,
            username: `Thành viên ${i + 1}`,
            role: i === 0 ? "leader" as const : "member" as const,
        })),
        createdBy: "admin",
        createdAt: new Date().toISOString(),
    }));

    const selectedChannel = enrichedGroups.find((g) => g.id === selectedChannelId);

    return (
        // --- THAY ĐỔI 1: Thêm `overflow-hidden` vào thẻ div bao ngoài cùng ---
        <div className={`flex h-full w-full ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>

            {/* Cột danh sách kênh (bên trái) */}
            <div className={`w-80 border-r flex flex-col ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                <ChannelList
                    selectedChannelId={selectedChannelId}
                    onSelectChannel={setSelectedChannelId}
                    onDeleteGroup={handleDeleteGroup}
                    onCreateGroup={() => setCreateGroupModalOpen(true)}
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Khu vực chat chính và panel chi tiết */}
            <div className="flex-1 flex min-w-0">
                <div className="flex-1 flex flex-col min-w-0">
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

            {/* Các Modal */}
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