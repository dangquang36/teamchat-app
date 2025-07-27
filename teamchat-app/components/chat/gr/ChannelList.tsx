import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useGroups } from "@/contexts/GroupContext";
import { ChannelItem } from "./ChannelItem";
import { Group } from "@/contexts/GroupContext";

interface ChannelListProps {
    selectedChannelId: string | null;
    onSelectChannel: (channelId: string) => void;
    onDeleteGroup: (groupId: string) => void;
    onCreateGroup: () => void;
    isDarkMode?: boolean;
}

export function ChannelList({
    selectedChannelId,
    onSelectChannel,
    onDeleteGroup,
    onCreateGroup,
    isDarkMode = false,
}: ChannelListProps) {
    const { groups } = useGroups();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredChannels = groups.filter((group) =>
        group.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return (
        <>
            <div className={`p-4 border-b flex-shrink-0 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                    <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Kênh
                    </h2>
                    <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white w-7 h-7 rounded-full p-0 flex items-center justify-center"
                        onClick={onCreateGroup}
                        aria-label="Tạo kênh mới"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto px-4 py-3 scrollbar-hide`}>
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
                    {filteredChannels.map((group: Group) => (
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
        </>
    );
}