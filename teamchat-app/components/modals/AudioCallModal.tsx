'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext"; // ✅ 1. Import hook useTheme

interface AudioCallModalProps {
    onClose: () => void;
    // Thêm các props khác nếu cần, ví dụ tên người gọi, trạng thái
    userName: string;
    callStatus: "connecting" | "connected" | "ringing" | "incoming";
}

export function AudioCallModal({ onClose, userName, callStatus: initialStatus }: AudioCallModalProps) {
    const { isDarkMode } = useTheme(); // ✅ 2. Lấy trạng thái sáng/tối
    const [isMuted, setIsMuted] = useState(false);
    const [isOnSpeaker, setIsOnSpeaker] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState(initialStatus);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callStatus === "connected") {
            timer = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [callStatus]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getStatusText = () => {
        switch (callStatus) {
            case "connecting":
                return "Đang kết nối...";
            case "ringing":
                return "Đang gọi...";
            case "incoming":
                return "Cuộc gọi đến...";
            case "connected":
                return formatDuration(callDuration);
            default:
                return "Đang gọi...";
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const toggleSpeaker = () => setIsOnSpeaker(!isOnSpeaker);

    const handleAcceptCall = () => setCallStatus("connected");

    // Component nút điều khiển để tái sử dụng
    const ControlButton = ({ onClick, title, variant = 'default', children }: any) => {
        const baseClasses = "w-14 h-14 rounded-full flex items-center justify-center transition-colors text-white";
        let variantClasses = "";

        switch (variant) {
            case 'destructive':
                variantClasses = "bg-red-500 hover:bg-red-600";
                break;
            case 'success':
                variantClasses = "bg-green-500 hover:bg-green-600";
                break;
            case 'active':
                variantClasses = "bg-purple-600 hover:bg-purple-700";
                break;
            default:
                variantClasses = isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300 text-gray-800";
        }

        return (
            <button onClick={onClick} title={title} className={`${baseClasses} ${variantClasses}`}>
                {children}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-8 max-w-md w-full mx-4 text-center relative overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Hiệu ứng sóng âm thanh */}
                {callStatus === "connected" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-4 border-purple-500/20 rounded-full animate-ping opacity-20"></div>
                        <div
                            className="absolute w-48 h-48 border-4 border-purple-500/30 rounded-full animate-ping opacity-30"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                    </div>
                )}

                {/* Avatar và thông tin */}
                <div className="relative z-10">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center relative">
                        {/* ✅ Sửa lỗi: Thêm kiểm tra để tránh lỗi khi userName không tồn tại */}
                        <span className="text-white font-bold text-4xl">{(userName || '?').charAt(0).toUpperCase()}</span>
                    </div>

                    <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userName || 'Đang tải...'}</h3>
                    <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getStatusText()}</p>

                    {/* Điều khiển cuộc gọi */}
                    <div className="flex justify-center space-x-4">
                        {callStatus === "connected" ? (
                            <>
                                <ControlButton onClick={toggleMute} title={isMuted ? "Bật mic" : "Tắt mic"} variant={isMuted ? 'destructive' : 'default'}>
                                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </ControlButton>
                                <ControlButton onClick={toggleSpeaker} title={isOnSpeaker ? "Tắt loa ngoài" : "Bật loa ngoài"} variant={isOnSpeaker ? 'active' : 'default'}>
                                    {/* Bạn có thể thay bằng icon loa ngoài nếu có */}
                                    <div className="w-6 h-6 border-2 border-current rounded"></div>
                                </ControlButton>
                                <ControlButton onClick={onClose} title="Kết thúc cuộc gọi" variant="destructive">
                                    <Phone size={24} className="rotate-[135deg]" />
                                </ControlButton>
                            </>
                        ) : (
                            <>
                                <ControlButton onClick={handleAcceptCall} title="Nhận cuộc gọi" variant="success">
                                    <Phone size={24} />
                                </ControlButton>
                                <ControlButton onClick={onClose} title="Từ chối cuộc gọi" variant="destructive">
                                    <PhoneOff size={24} />
                                </ControlButton>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
