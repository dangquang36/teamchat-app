import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Edit2, Save, Mail, UserMinus, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";

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

    const isLeader = currentUser.role === "leader";

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
            className="w-full sm:w-80 border-l p-4 transition-colors h-screen overflow-y-auto bg-white border-gray-200 text-black"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Thông tin kênh</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5 text-black" />
                </Button>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="info">
                    <AccordionTrigger>Thông tin</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <div className="relative group">
                                <h3 className="text-sm font-semibold">Tên kênh</h3>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={channelName}
                                            onChange={(e) => setChannelName(e.target.value)}
                                            className="text-sm bg-white text-black border-gray-300"
                                        />
                                        <Button size="sm" onClick={handleSaveName} className="bg-white text-black hover:bg-gray-100">
                                            <Save className="h-4 w-4 text-black" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm">{channelName}</p>
                                        {isLeader && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 bg-white text-black hover:bg-gray-100"
                                                onClick={() => setIsEditingName(true)}
                                            >
                                                <Edit2 className="h-4 w-4 text-black" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <h3 className="text-sm font-semibold">Mô tả</h3>
                                {isEditingDesc ? (
                                    <div className="flex flex-col gap-2">
                                        <Textarea
                                            value={channelDesc}
                                            onChange={(e) => setChannelDesc(e.target.value)}
                                            className="text-sm bg-white text-black border-gray-300"
                                        />
                                        <Button size="sm" onClick={handleSaveDesc} className="bg-white text-black hover:bg-gray-100">
                                            <Save className="h-4 w-4 text-black" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm">{channelDesc}</p>
                                        {isLeader && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 bg-white text-black hover:bg-gray-100"
                                                onClick={() => setIsEditingDesc(true)}
                                            >
                                                <Edit2 className="h-4 w-4 text-black" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="members">
                    <AccordionTrigger>Thành viên</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            <p className="text-sm">{channel.members} Thành viên</p>
                            <Button onClick={() => setIsMemberModalOpen(true)} className="bg-white text-black hover:bg-gray-100">
                                Quản lý thành viên
                            </Button>
                            {!isLeader && (
                                <Button variant="destructive" onClick={handleLeaveChannel} className="bg-white text-black hover:bg-gray-100">
                                    Rời kênh
                                </Button>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pinned">
                    <AccordionTrigger>Tin nhắn ghim</AccordionTrigger>
                    <AccordionContent>
                        {channel.pinnedMessages.length > 0 ? (
                            channel.pinnedMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className="p-2 rounded-lg relative group bg-gray-100"
                                >
                                    <p className="text-sm text-black">{msg.text}</p>
                                    <p className="text-xs text-gray-600">
                                        Pinned by {msg.pinnedBy} at {msg.time}
                                    </p>
                                    {isLeader && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white text-black hover:bg-gray-100"
                                            onClick={() => handleUnpinMessage(index)}
                                        >
                                            <X className="h-4 w-4 text-black" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Không có tin nhắn ghim</p>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
                <DialogContent className="bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>Quản lý thành viên</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Email để mời"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="bg-white text-black border-gray-300"
                            />
                            <Button onClick={handleInviteMember} disabled={!isLeader} className="bg-white text-black hover:bg-gray-100">
                                <UserPlus className="h-4 w-4 mr-2 text-black" /> Mời
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {channel.membersList.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <div>
                                        <p className="text-sm text-black">{member.username}</p>
                                        <p className="text-xs text-gray-600">
                                            {member.role === "leader" ? "Trưởng nhóm" : "Thành viên"}
                                        </p>
                                    </div>
                                    {isLeader && member.id !== currentUser.id && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleKickMember(member.id)}
                                            className="bg-white text-black hover:bg-gray-100"
                                        >
                                            <UserMinus className="h-4 w-4 text-black" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMemberModalOpen(false)} className="bg-white text-black hover:bg-gray-100">
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}