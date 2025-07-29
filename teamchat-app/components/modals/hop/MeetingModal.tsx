"use client";

import { useState } from "react";
import { X, Link, Copy, Check } from "lucide-react";
import { Button } from '@/components/ui/button';

interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartCall?: (title: string, roomName?: string) => void;
}

export function MeetingModal({ isOpen, onClose, onStartCall }: MeetingModalProps) {
    const [meetingTitle, setMeetingTitle] = useState("");
    const [customRoomName, setCustomRoomName] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showLinkGenerated, setShowLinkGenerated] = useState(false);

    if (!isOpen) return null;

    // Tạo room name từ custom name hoặc meeting title
    const generateRoomName = (customName: string, title: string) => {
        const baseName = customName.trim() || title.trim();
        if (!baseName) return '';

        // Chuyển thành slug-friendly format
        return baseName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
            .replace(/\s+/g, '-') // Thay space bằng dash
            .replace(/-+/g, '-') // Loại bỏ dash trùng lặp
            .trim();
    };

    const handleCreateLink = async () => {
        if (!meetingTitle.trim()) {
            alert("Vui lòng nhập tiêu đề cuộc họp");
            return;
        }

        setIsCreating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const roomName = generateRoomName(customRoomName, meetingTitle);
        const baseUrl = window.location.origin;
        const meetingLink = `${baseUrl}/dashboard/meeting/${roomName}`;

        setGeneratedLink(meetingLink);
        setShowLinkGenerated(true);
        setIsCreating(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = generatedLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const handleStartDirectCall = async () => {
        if (!meetingTitle.trim()) {
            alert("Vui lòng nhập tiêu đề cuộc họp");
            return;
        }

        setIsCreating(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const roomName = generateRoomName(customRoomName, meetingTitle);
        onStartCall?.(meetingTitle, roomName);
        setIsCreating(false);
    };

    const handleClose = () => {
        // Reset state when closing
        setMeetingTitle("");
        setCustomRoomName("");
        setGeneratedLink("");
        setShowLinkGenerated(false);
        setLinkCopied(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    disabled={isCreating}
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-1">Hop</h2>
                </div>

                {!showLinkGenerated ? (
                    <>
                        {/* Meeting Title Input */}
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm mb-3">
                                Đặt tiêu đề cho cuộc họp của bạn.
                            </label>
                            <input
                                type="text"
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Ví dụ: Họp nhóm dự án"
                                disabled={isCreating}
                            />
                        </div>

                        {/* Custom Room Name Input */}
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm mb-3">
                                Tên phòng tùy chỉnh (tùy chọn)
                            </label>
                            <input
                                type="text"
                                value={customRoomName}
                                onChange={(e) => setCustomRoomName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="my-awesome-meeting"
                                disabled={isCreating}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                {customRoomName.trim() || meetingTitle.trim() ? (
                                    <>Liên kết sẽ là: .../meeting/{generateRoomName(customRoomName, meetingTitle)}</>
                                ) : (
                                    "Nếu để trống sẽ tự động tạo từ tiêu đề cuộc họp"
                                )}
                            </p>
                        </div>

                        {/* Start Direct Call Button */}
                        <Button
                            onClick={handleStartDirectCall}
                            disabled={isCreating || !meetingTitle.trim()}
                            variant="outline"
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-all duration-200"
                        >
                            {isCreating ? "Đang bắt đầu..." : "Bắt đầu họp ngay"}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Generated Link Display */}
                        <div className="mb-6">
                            <label className="block text-gray-300 text-sm mb-3">
                                Liên kết cuộc họp của bạn:
                            </label>
                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4">
                                <p className="text-white text-sm break-all">{generatedLink}</p>
                            </div>

                            <Button
                                onClick={handleCopyLink}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center mb-4"
                            >
                                {linkCopied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Đã sao chép!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Sao chép liên kết
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    const roomName = generateRoomName(customRoomName, meetingTitle);
                                    onStartCall?.(meetingTitle, roomName);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
                            >
                                Tham gia ngay
                            </Button>

                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white py-3 rounded-lg font-medium transition-all duration-200"
                            >
                                Đóng
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}