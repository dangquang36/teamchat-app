'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Settings,
    Monitor,
    Volume2,
    Camera,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface MeetingReadyInterfaceProps {
    meetingTitle: string;
    meetingId: string;
    currentUser: any;
    participantCount?: number;
    onJoinMeeting: (settings: MeetingSettings) => void;
    onCancel: () => void;
}

interface MeetingSettings {
    videoEnabled: boolean;
    audioEnabled: boolean;
    displayName: string;
}

export default function MeetingReadyInterface({
    meetingTitle,
    meetingId,
    currentUser,
    participantCount = 0,
    onJoinMeeting,
    onCancel
}: MeetingReadyInterfaceProps) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [displayName, setDisplayName] = useState(currentUser?.name || 'Người dùng');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'good' | 'poor'>('checking');
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Kiểm tra kết nối
        setTimeout(() => {
            setConnectionStatus('good');
        }, 2000);

        // Xin quyền truy cập media
        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: isVideoEnabled,
                    audio: isAudioEnabled
                });
                setMediaStream(stream);
                if (videoRef.current && isVideoEnabled) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                toast({
                    title: "Không thể truy cập camera/microphone",
                    description: "Vui lòng cho phép truy cập để tham gia cuộc họp",
                    variant: "destructive"
                });
            }
        };

        initializeMedia();

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoEnabled, isAudioEnabled]);

    const handleJoinMeeting = () => {
        setIsLoading(true);
        setTimeout(() => {
            onJoinMeeting({
                videoEnabled: isVideoEnabled,
                audioEnabled: isAudioEnabled,
                displayName
            });
        }, 1500);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConnectionStatusIcon = () => {
        switch (connectionStatus) {
            case 'checking':
                return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
            case 'good':
                return <Wifi className="w-4 h-4 text-green-500" />;
            case 'poor':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8">
                {/* Left Side - Video Preview */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    {/* Video Preview Card */}
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                                {isVideoEnabled ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                                        <div className="text-center">
                                            <Avatar className="w-24 h-24 mx-auto mb-4">
                                                <AvatarImage src={currentUser?.avatar} />
                                                <AvatarFallback className="text-2xl bg-blue-600 text-white">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-white text-lg font-medium">{displayName}</p>
                                            <p className="text-slate-400 text-sm">Camera đã tắt</p>
                                        </div>
                                    </div>
                                )}

                                {/* Video Controls Overlay */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <motion.div
                                        className="flex items-center space-x-3 bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                            className={`rounded-full p-2 ${isAudioEnabled
                                                ? 'text-white hover:bg-slate-700'
                                                : 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                                            className={`rounded-full p-2 ${isVideoEnabled
                                                ? 'text-white hover:bg-slate-700'
                                                : 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full p-2 text-white hover:bg-slate-700"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Device Status */}
                    <motion.div
                        className="flex items-center justify-center space-x-6 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center space-x-2">
                            {getConnectionStatusIcon()}
                            <span className="text-slate-300">
                                {connectionStatus === 'checking' ? 'Đang kiểm tra kết nối...' :
                                    connectionStatus === 'good' ? 'Kết nối tốt' : 'Kết nối kém'}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Side - Meeting Info & Join */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6 flex flex-col justify-center"
                >
                    {/* Meeting Header */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <Video className="w-8 h-8 text-white" />
                        </motion.div>

                        <h1 className="text-3xl font-bold text-white mb-2">Sẵn sàng tham gia?</h1>
                        <p className="text-slate-400">Kiểm tra thiết bị của bạn trước khi vào cuộc họp</p>
                    </div>

                    {/* Meeting Details */}
                    <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-white font-medium">{meetingTitle}</p>
                                    <p className="text-slate-400 text-sm">ID: {meetingId}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 text-sm">{participantCount} người tham gia</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 text-sm">{formatTime(currentTime)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Name Input */}
                    <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
                        <CardContent className="p-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tên hiển thị
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Nhập tên của bạn..."
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            Hủy
                        </Button>

                        <Button
                            onClick={handleJoinMeeting}
                            disabled={isLoading || !displayName.trim()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium relative overflow-hidden"
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center"
                                    >
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Đang tham gia...
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="join"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center"
                                    >
                                        <Video className="w-4 h-4 mr-2" />
                                        Tham gia cuộc họp
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-slate-400">
                                {isAudioEnabled ? 'Mic bật' : 'Mic tắt'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-slate-400">
                                {isVideoEnabled ? 'Camera bật' : 'Camera tắt'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}