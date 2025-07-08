import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Phone } from "lucide-react";

interface AudioCallModalProps {
    onClose: () => void;
}

export function AudioCallModal({ onClose }: AudioCallModalProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isOnSpeaker, setIsOnSpeaker] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ringing">("connecting");

    useEffect(() => {
        const connectTimer = setTimeout(() => {
            setCallStatus("ringing");
            setTimeout(() => {
                setCallStatus("connected");
            }, 3000);
        }, 2000);

        return () => clearTimeout(connectTimer);
    }, []);

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
            case "connected":
                return formatDuration(callDuration);
            default:
                return "Đang gọi...";
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);
    const toggleSpeaker = () => setIsOnSpeaker(!isOnSpeaker);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center relative">
                {/* Hiệu ứng sóng âm thanh */}
                {callStatus === "connected" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-4 border-purple-200 rounded-full animate-ping opacity-20"></div>
                        <div
                            className="absolute w-48 h-48 border-4 border-purple-300 rounded-full animate-ping opacity-30"
                            style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                            className="absolute w-32 h-32 border-4 border-purple-400 rounded-full animate-ping opacity-40"
                            style={{ animationDelay: "1s" }}
                        ></div>
                    </div>
                )}

                {/* Avatar và thông tin */}
                <div className="relative z-10">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center relative">
                        <span className="text-white font-bold text-4xl">VL</span>
                        {callStatus === "connected" && !isMuted && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-semibold mb-2 text-gray-900">Victoria Lane</h3>
                    <p className="text-lg text-gray-600 mb-8">{getStatusText()}</p>

                    {/* Trạng thái cuộc gọi */}
                    <div className="flex justify-center items-center space-x-4 mb-8">
                        {callStatus === "connected" && (
                            <>
                                {isMuted && (
                                    <div className="flex items-center space-x-2 text-red-500">
                                        <Mic className="h-4 w-4" style={{ textDecoration: "line-through" }} />
                                        <span className="text-sm">Mic đã tắt</span>
                                    </div>
                                )}
                                {isOnSpeaker && (
                                    <div className="flex items-center space-x-2 text-blue-500">
                                        <div className="w-4 h-4 border-2 border-current rounded"></div>
                                        <span className="text-sm">Loa ngoài</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Điều khiển cuộc gọi */}
                    <div className="flex justify-center space-x-4">
                        {callStatus === "connected" ? (
                            <>
                                {/* Nút tắt/bật mic */}
                                <button
                                    onClick={toggleMute}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"
                                        } text-white`}
                                    title={isMuted ? "Bật mic" : "Tắt mic"}
                                >
                                    <Mic className="h-6 w-6" />
                                </button>

                                {/* Nút loa ngoài */}
                                <button
                                    onClick={toggleSpeaker}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isOnSpeaker ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
                                        } text-white`}
                                    title={isOnSpeaker ? "Tắt loa ngoài" : "Bật loa ngoài"}
                                >
                                    <div className="w-6 h-6 border-2 border-current rounded"></div>
                                </button>

                                {/* Nút kết thúc */}
                                <button
                                    onClick={onClose}
                                    className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    title="Kết thúc cuộc gọi"
                                >
                                    <Phone className="h-6 w-6 rotate-[135deg]" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Nút nhận cuộc gọi */}
                                <button
                                    onClick={() => setCallStatus("connected")}
                                    className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    title="Nhận cuộc gọi"
                                >
                                    <Phone className="h-6 w-6" />
                                </button>

                                {/* Nút từ chối */}
                                <button
                                    onClick={onClose}
                                    className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    title="Từ chối cuộc gọi"
                                >
                                    <Phone className="h-6 w-6 rotate-[135deg]" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}