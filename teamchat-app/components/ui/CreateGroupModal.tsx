'use client';

import React, { useState, useRef } from "react";
import { X, User, Info, Lock, Globe, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";

// Định nghĩa kiểu dữ liệu cho thông tin nhóm mới
export interface GroupData {
    avatar: File | null;
    name: string;
    about: string;
    type: 'public' | 'private';
}

// Định nghĩa kiểu dữ liệu cho props của Modal
interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGroup: (groupData: GroupData) => void;
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
    const { isDarkMode } = useTheme();

    // --- STATE MANAGEMENT ---
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [groupName, setGroupName] = useState("");
    const [about, setAbout] = useState("");
    const [groupType, setGroupType] = useState<'public' | 'private'>('public');

    // --- REFS ---
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- HANDLERS ---
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) {
            alert("Vui lòng nhập tên nhóm.");
            return;
        }

        onCreateGroup({
            avatar: avatarFile,
            name: groupName,
            about: about,
            type: groupType,
        });

        // Đóng modal sau khi gửi dữ liệu đi
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black"}>
                <DialogHeader>
                    <DialogTitle className="text-xl">Tạo Nhóm mới</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* --- Avatar Uploader --- */}
                    <div className="flex justify-center">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            hidden
                        />
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-purple-500 transition-colors"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Xem trước" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <UploadCloud className="mx-auto h-8 w-8" />
                                    <span className="text-xs mt-1">Tải ảnh lên</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* --- Group Name --- */}
                    <div className="space-y-2">
                        <Label htmlFor="group-name">Tên nhóm</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="group-name"
                                placeholder="Ví dụ: Team Marketing"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    {/* --- About --- */}
                    <div className="space-y-2">
                        <Label htmlFor="about">Mô tả</Label>
                        <div className="relative">
                            <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Textarea
                                id="about"
                                placeholder="Mô tả ngắn về nhóm của bạn..."
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* --- Group Type --- */}
                    <div className="space-y-3">
                        <Label>Loại nhóm</Label>
                        <RadioGroup defaultValue={groupType} onValueChange={(value: 'public' | 'private') => setGroupType(value)}>
                            <div className={`flex items-center space-x-2 p-3 border rounded-md ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                                <RadioGroupItem value="public" id="public" />
                                <Globe className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <Label htmlFor="public" className="flex-1 cursor-pointer">Công khai</Label>
                            </div>
                            <div className={`flex items-center space-x-2 p-3 border rounded-md ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                                <RadioGroupItem value="private" id="private" />
                                <Lock className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                <Label htmlFor="private" className="flex-1 cursor-pointer">Riêng tư</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Tạo nhóm</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}