import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal, GroupData } from "@/components/ui/CreateGroupModal";
import { ChannelItem } from "./ChannelItem";
import { Group } from "@/contexts/GroupContext";

interface ChannelListProps {
    selectedChannelId: string | null;
    onSelectChannel: (channelId: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onCreateGroup: (groupData: GroupData) => void;
    isDarkMode?: boolean;
}

export function ChannelList({
    selectedChannelId,
    onSelectChannel,
    onDeleteGroup,
    onCreateGroup,
    isDarkMode = false,
}: ChannelListProps) {
    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const { groups } = useGroups();

    const handleCreate = (groupData: GroupData) => {
        onCreateGroup(groupData);
        setCreateGroupModalOpen(false);
    };

    return (
        <>
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
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-3`}>
                    TẤT CẢ KÊNH
                </h3>
                <div className="space-y-1">
                    {groups.map((group: Group) => (
                        <ChannelItem
                            key={group.id}
                            name={group.name}
                            members={`${group.members} Thành viên`}
                            avatar={group.avatar}
                            active={selectedChannelId === group.id}
                            isDarkMode={isDarkMode}
                            onClick={() => onSelectChannel(group.id)}
                            onDelete={() => onDeleteGroup(group.id)}
                        />
                    ))}
                </div>
            </div>

            {isCreateGroupModalOpen && (
                <CreateGroupModal
                    isOpen={isCreateGroupModalOpen}
                    onClose={() => setCreateGroupModalOpen(false)}
                    onCreateGroup={handleCreate}
                />
            )}
        </>
    );
}