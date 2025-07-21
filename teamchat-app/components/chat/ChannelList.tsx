import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { CreateGroupModal } from "@/components/ui/CreateGroupModal";
import { ChannelItem } from "./ChannelItem";
import { Group } from "@/contexts/GroupContext";

interface ChannelListProps {
    selectedChannelId: string | null;
    onSelectChannel: (channelId: string) => void;
    isDarkMode?: boolean;
}

export function ChannelList({
    selectedChannelId,
    onSelectChannel,
    isDarkMode = false,
}: ChannelListProps) {
    const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const { groups } = useGroups();

    return (
        <>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3
                        className={`text-xs font-semibold mb-3 uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
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
                    {groups.map((group: Group) => (
                        <ChannelItem
                            key={group.id}
                            name={group.name}
                            members={`${group.members} Thành viên`}
                            active={selectedChannelId === group.id}
                            isDarkMode={isDarkMode}
                            onClick={() => onSelectChannel(group.id)}
                        />
                    ))}
                </div>
            </div>

            {isCreateGroupModalOpen && (
                <CreateGroupModal onClose={() => setCreateGroupModalOpen(false)} />
            )}
        </>
    );
}
