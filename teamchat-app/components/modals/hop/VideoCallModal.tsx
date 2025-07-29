"use client";

import { useState, useEffect, useRef } from "react";
import {
    X,
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Users,
    MessageSquare,
    Monitor,
    Volume2,
    VolumeX
} from "lucide-react";
import { Button } from '@/components/ui/button';

interface VideoCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingTitle: string;
    meetingId: string;
    onCallEnd?: (duration: number) => void;
}

export function VideoCallModal({
    isOpen,
    onClose,
    meetingTitle,
    meetingId,
    onCallEnd
}: VideoCallModalProps) {
    // State cho luồng media và điều khiển
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // State cho cuộc gọi
    const [callDuration, setCallDuration] = useState(0);
    const [isCallStarted, setIsCallStarted] = useState(false);

    // Ref cho thẻ video
    const videoRef = useRef<HTMLVideoElement>(null);

    // useEffect chính để quản lý media stream
    useEffect(() => {
        if (isOpen) {
            // Hàm để khởi động camera/mic
            const startMedia = async () => {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });
                    setStream(mediaStream);
                    setIsCallStarted(true);
                    setCallDuration(0);
                } catch (error) {
                    console.error("Lỗi khi truy cập camera/mic:", error);
                    // Có thể hiển thị thông báo cho người dùng ở đây
                    alert("Không thể truy cập camera và micro. Vui lòng cấp quyền trong cài đặt trình duyệt.");
                    onClose(); // Đóng modal nếu không có quyền
                }
            };
            startMedia();
        } else {
            // Hàm dọn dẹp khi modal đóng
            const stopMedia = () => {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    setStream(null);
                    setIsCallStarted(false);
                }
            };
            stopMedia();
        }

        // Hàm cleanup của useEffect, chạy khi component bị unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]); // Chỉ chạy khi `isOpen` thay đổi

    // Gán stream vào thẻ video khi có stream
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Timer cho thời lượng cuộc gọi
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isCallStarted) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCallStarted]);

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // -- Cập nhật logic các hàm điều khiển --

    const handleToggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOn(prev => !prev);
        }
    };

    const handleToggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioOn(prev => !prev);
        }
    };

    const handleEndCall = () => {
        onCallEnd?.(callDuration);
        onClose(); // useEffect sẽ tự động dọn dẹp stream
    };

    // Các hàm khác giữ nguyên (tạm thời)
    const handleToggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);
    const handleScreenShare = () => setIsScreenSharing(!isScreenSharing);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm">
                <div>
                    <h2 className="font-semibold">{meetingTitle || "Cuộc họp video"}</h2>
                    <span className="text-gray-400 text-sm">#{meetingId}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-sm bg-red-600 px-3 py-1 rounded-full">
                        ● {formatDuration(callDuration)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-700">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative bg-gray-900 overflow-hidden">
                {/* Thẻ <video> để hiển thị stream */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted // Tắt tiếng của chính mình để tránh vọng lại
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOn && stream ? "opacity-100" : "opacity-0"}`}
                />

                {/* Placeholder khi camera tắt hoặc chưa có stream */}
                {(!isVideoOn || !stream) && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <VideoOff className="h-16 w-16 text-gray-400" />
                            </div>
                            <p className="text-white text-lg">Camera đã tắt</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-gray-900/90 backdrop-blur-sm p-4">
                <div className="flex items-center justify-center space-x-4">
                    <Button onClick={handleToggleAudio} size="lg" className={`rounded-full w-14 h-14 ${!isAudioOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                    </Button>

                    <Button onClick={handleToggleVideo} size="lg" className={`rounded-full w-14 h-14 ${!isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                    </Button>

                    <Button onClick={handleScreenShare} size="lg" className={`rounded-full w-14 h-14 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <Monitor className="h-6 w-6" />
                    </Button>

                    <Button onClick={handleEndCall} size="lg" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 ml-8">
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}