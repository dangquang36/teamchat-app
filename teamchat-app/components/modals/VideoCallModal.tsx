'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone, MessageCircle, ScreenShare, ScreenShareOff, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext"; // ✅ 1. Import hook useTheme

interface VideoCallModalProps {
    onClose: () => void;
    // Thêm các props khác nếu cần, ví dụ như thông tin người đang gọi
    userName: string;
}

export function VideoCallModal({ onClose, userName }: VideoCallModalProps) {
    const { isDarkMode } = useTheme(); // ✅ 2. Lấy trạng thái sáng/tối
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const toggleVideo = () => setIsVideoOff(!isVideoOff);
    const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

    // Component nút điều khiển để tái sử dụng
    const ControlButton = ({ onClick, title, isActive, isDestructive = false, children }: any) => (
        <button
            onClick={onClick}
            title={title}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors text-white ${isDestructive
                    ? 'bg-red-500 hover:bg-red-600'
                    : isActive
                        ? (isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600')
                        : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg overflow-hidden max-w-6xl w-full mx-auto relative h-[90vh] flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {/* Header */}
                <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg px-4 py-2">
                    <div className="text-white">
                        <h3 className="font-semibold">{userName}</h3>
                        <p className="text-sm text-gray-300">Cuộc gọi video • {formatDuration(callDuration)}</p>
                    </div>
                </div>

                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Khu vực video chính */}
                <div className={`flex-1 relative flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    {/* Video của người khác. Nếu họ tắt video, hiển thị avatar */}
                    <div className="text-center">
                        <div className={`w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${isDarkMode ? 'from-purple-600 to-indigo-700' : 'from-purple-500 to-indigo-600'}`}>
                            <span className="text-6xl font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{userName}</h3>
                        {isVideoOff && <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Camera đã tắt</p>}
                    </div>

                    {/* Khung video của bản thân */}
                    <div className={`absolute top-4 right-20 w-40 h-32 rounded-lg flex items-center justify-center border-2 overflow-hidden ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-white bg-gray-900'}`}>
                        {isVideoOff ? (
                            <div className="text-center text-white">
                                <VideoOff size={32} className="mx-auto mb-2" />
                                <span className="font-bold text-sm">Camera tắt</span>
                            </div>
                        ) : (
                            // Trong ứng dụng thật, đây sẽ là thẻ <video>
                            <div className="w-full h-full bg-green-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">Bạn</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Thanh điều khiển */}
                <div className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'}`}>
                    <div className="flex justify-center items-center space-x-4">
                        <ControlButton onClick={toggleMute} title={isMuted ? "Bật mic" : "Tắt mic"} isActive={!isMuted}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </ControlButton>

                        <ControlButton onClick={toggleVideo} title={isVideoOff ? "Bật camera" : "Tắt camera"} isActive={!isVideoOff}>
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </ControlButton>

                        <ControlButton onClick={toggleScreenShare} title={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"} isActive={!isScreenSharing}>
                            {isScreenSharing ? <ScreenShareOff size={24} /> : <ScreenShare size={24} />}
                        </ControlButton>

                        <ControlButton onClick={() => { }} title="Mở chat" isActive={true}>
                            <MessageCircle size={24} />
                        </ControlButton>

                        <ControlButton onClick={onClose} title="Kết thúc cuộc gọi" isDestructive={true}>
                            <Phone size={24} className="rotate-[135deg]" />
                        </ControlButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
