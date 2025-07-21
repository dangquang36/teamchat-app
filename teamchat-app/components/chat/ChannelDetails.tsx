import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Edit2, Save, Mail, UserMinus, UserPlus, Newspaper } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Channel {
    id: string;
    name: string;
    members: number;
    description: string;
    pinnedMessages: { text: string; time: string; pinnedBy: string }[];
    membersList: { id: string; username: string; role: "leader" | "member" }[];
}

interface ChannelDetailsProps {
    channel: Channel;
    isDarkMode: boolean;
    onClose: () => void;
    currentUser: { id: string; role: "leader" | "member" };
}

export function ChannelDetails({ channel, isDarkMode, onClose, currentUser }: ChannelDetailsProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [channelName, setChannelName] = useState(channel.name);
    const [channelDesc, setChannelDesc] = useState(channel.description);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const router = useRouter();

    const isLeader = currentUser.role === "leader";

    const handleNavigateToPosts = () => {
        router.push(`/dashboard/posts`);
    };

    const handleSaveName = async () => {
        try {
            const response = await fetch(`/api/channels/${channel.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: channelName }),
            });
            if (response.ok) {
                toast({ title: "Success", description: "Channel name updated" });
                setIsEditingName(false);
            } else {
                throw new Error("Failed to update channel name");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update channel name" });
        }
    };

    const handleSaveDesc = async () => {
        try {
            const response = await fetch(`/api/channels/${channel.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: channelDesc }),
            });
            if (response.ok) {
                toast({ title: "Success", description: "Channel description updated" });
                setIsEditingDesc(false);
            } else {
                throw new Error("Failed to update description");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to update description" });
        }
    };

    const handleInviteMember = async () => {
        try {
            const response = await fetch(`/api/channels/${channel.id}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });
            if (response.ok) {
                toast({ title: "Success", description: "Invitation sent" });
                setInviteEmail("");
            } else {
                throw new Error("Failed to send invitation");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to send invitation" });
        }
    };

    const handleKickMember = async (memberId: string) => {
        try {
            const response = await fetch(`/api/channels/${channel.id}/members/${memberId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast({ title: "Success", description: "Member removed" });
            } else {
                throw new Error("Failed to remove member");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove member" });
        }
    };

    const handleLeaveChannel = async () => {
        if (isLeader) {
            toast({ title: "Error", description: "Leader cannot leave the channel" });
            return;
        }
        try {
            const response = await fetch(`/api/channels/${channel.id}/members/${currentUser.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast({ title: "Success", description: "You have left the channel" });
                onClose();
            } else {
                throw new Error("Failed to leave channel");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to leave channel" });
        }
    };

    const handleUnpinMessage = async (index: number) => {
        try {
            const response = await fetch(`/api/channels/${channel.id}/pinned-messages/${index}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast({ title: "Success", description: "Message unpinned" });
            } else {
                throw new Error("Failed to unpin message");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to unpin message" });
        }
    };

    return (
        <div
            className={`w-full sm:w-80 border-l p-4 transition-colors h-screen overflow-y-auto ${isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200 text-gray-900"
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Thông tin kênh</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className={`h-5 w-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                </Button>
            </div>

            <Accordion type="multiple" className="w-full" defaultValue={['info', 'members']}>
                {/* --- Phần thông tin --- */}
                <AccordionItem value="info">
                    <AccordionTrigger>Thông tin</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <Button variant="outline" size="sm" onClick={handleNavigateToPosts} className="w-full">
                            <Newspaper className="h-4 w-4 mr-2" />
                            Xem bài đăng
                        </Button>
                        {/* Sửa Tên kênh */}
                        <div className="relative group">
                            <h3 className="text-sm font-semibold mb-1">Tên kênh</h3>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        className={`text-sm h-9 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                    {/* ✅ KẾT NỐI HÀM LƯU TÊN */}
                                    <Button size="sm" onClick={handleSaveName}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <p className="text-sm py-2">{channelName}</p>
                                    {isLeader && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7"
                                            onClick={() => setIsEditingName(true)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ✅ THÊM LẠI PHẦN SỬA MÔ TẢ */}
                        <div className="relative group">
                            <h3 className="text-sm font-semibold mb-1">Mô tả</h3>
                            {isEditingDesc ? (
                                <div className="flex flex-col items-end gap-2">
                                    <Textarea
                                        value={channelDesc}
                                        onChange={(e) => setChannelDesc(e.target.value)}
                                        className={`text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    />
                                    <Button size="sm" onClick={handleSaveDesc}>
                                        <Save className="h-4 w-4" /> Lưu
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <p className="text-sm py-2 pr-2 whitespace-pre-wrap">{channelDesc || "Không có mô tả."}</p>
                                    {isLeader && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7 flex-shrink-0"
                                            onClick={() => setIsEditingDesc(true)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* --- Phần thành viên --- */}
                <AccordionItem value="members">
                    <AccordionTrigger>Thành viên</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            <p className="text-sm mb-2">{channel.members} Thành viên</p>
                            {/* ✅ SỬA NÚT QUẢN LÝ THÀNH VIÊN */}
                            <Button variant="outline" size="sm" onClick={() => setIsMemberModalOpen(true)} className="w-full">
                                Quản lý thành viên
                            </Button>
                            {/* ✅ SỬA NÚT RỜI KÊNH */}
                            {!isLeader && (
                                <Button variant="destructive" size="sm" onClick={handleLeaveChannel} className="w-full">
                                    Rời kênh
                                </Button>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* --- Phần tin nhắn ghim --- */}
                <AccordionItem value="pinned">
                    <AccordionTrigger>Tin nhắn ghim</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {channel.pinnedMessages.length > 0 ? (
                                channel.pinnedMessages.map((msg, index) => (
                                    // ✅ SỬA PHẦN NỀN VÀ CHỮ
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg relative group ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                                    >
                                        <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{msg.text}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Ghim bởi {msg.pinnedBy} lúc {msg.time}
                                        </p>
                                        {isLeader && (
                                            // ✅ SỬA NÚT BỎ GHIM
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-7 w-7"
                                                onClick={() => handleUnpinMessage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Không có tin nhắn ghim</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* --- Dialog quản lý thành viên --- */}
            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
                {/* ✅ SỬA NỀN VÀ CHỮ CỦA DIALOG */}
                <DialogContent className={isDarkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-white text-black"}>
                    <DialogHeader>
                        <DialogTitle>Quản lý thành viên</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {/* ✅ SỬA INPUT MỜI */}
                            <Input
                                placeholder="Email để mời"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className={isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}
                            />
                            {/* ✅ SỬA NÚT MỜI */}
                            <Button onClick={handleInviteMember} disabled={!isLeader}>
                                <UserPlus className="h-4 w-4 mr-2" /> Mời
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {channel.membersList.map((member) => (
                                // ✅ SỬA NỀN KHI HOVER
                                <div
                                    key={member.id}
                                    className={`flex justify-between items-center p-2 rounded-lg ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                                >
                                    <div>
                                        {/* ✅ SỬA MÀU CHỮ */}
                                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{member.username}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {member.role === "leader" ? "Trưởng nhóm" : "Thành viên"}
                                        </p>
                                    </div>
                                    {isLeader && member.id !== currentUser.id && (
                                        // ✅ SỬA NÚT KICK
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleKickMember(member.id)}
                                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMemberModalOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}