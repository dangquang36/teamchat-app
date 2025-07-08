import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Video, Phone, MessageCircle } from "lucide-react";

interface VideoCallModalProps {
    onClose: () => void;
}

export function VideoCallModal({ onClose }: VideoCallModalProps) {
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg overflow-hidden max-w-6xl w-full mx-4 relative h-[80vh]">
                {/* Header với thông tin cuộc gọi */}
                <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg px-4 py-2">
                    <div className="text-white">
                        <h3 className="font-semibold">Victoria Lane</h3>
                        <p className="text-sm text-gray-300">Cuộc gọi video • {formatDuration(callDuration)}</p>
                    </div>
                </div>

                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                    ✕
                </button>

                {/* Video chính */}
                <div className="relative h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    {isVideoOff ? (
                        <div className="text-center text-white">
                            <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-4xl font-bold">VL</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Victoria Lane</h3>
                            <p className="text-gray-300">Camera đã tắt</p>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-6xl font-bold">VL</span>
                                </div>
                                <h3 className="text-2xl font-semibold">Victoria Lane</h3>
                            </div>
                        </div>
                    )}

                    {/* Video nhỏ của bản thân */}
                    <div className="absolute top-4 right-20 w-32 h-24 bg-red-500 rounded-lg flex items-center justify-center border-2 border-white">
                        {isVideoOff ? (
                            <div className="text-center">
                                <span className="text-white font-bold text-sm">Camera tắt</span>
                            </div>
                        ) : (
                            <span className="text-white font-bold text-lg">D</span>
                        )}
                    </div>

                    {/* Thông báo chia sẻ màn hình */}
                    {isScreenSharing && (
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Đang chia sẻ màn hình</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thanh điều khiển */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-6">
                    <div className="flex justify-center items-center space-x-4">
                        {/* Nút tắt/bật mic */}
                        <button
                            onClick={toggleMute}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
                                } text-white`}
                            title={isMuted ? "Bật mic" : "Tắt mic"}
                        >
                            {isMuted ? (
                                <Mic className="h-5 w-5" style={{ textDecoration: "line-through" }} />
                            ) : (
                                <Mic className="h-5 w-5" />
                            )}
                        </button>

                        {/* Nút tắt/bật camera */}
                        <button
                            onClick={toggleVideo}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
                                } text-white`}
                            title={isVideoOff ? "Bật camera" : "Tắt camera"}
                        >
                            <Video className="h-5 w-5" />
                        </button>

                        {/* Nút chia sẻ màn hình */}
                        <button
                            onClick={toggleScreenShare}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-600 hover:bg-gray-700"
                                } text-white`}
                            title={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
                        >
                            <div className="w-5 h-5 border-2 border-current rounded"></div>
                        </button>

                        {/* Nút chat */}
                        <button
                            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                            title="Mở chat"
                        >
                            <MessageCircle className="h-5 w-5" />
                        </button>

                        {/* Nút kết thúc cuộc gọi */}
                        <button
                            onClick={onClose}
                            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                            title="Kết thúc cuộc gọi"
                        >
                            <Phone className="h-5 w-5 rotate-[135deg]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}