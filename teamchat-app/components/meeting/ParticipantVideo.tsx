'use client';

import { useEffect, useRef, useState } from 'react';
import {
    LocalParticipant,
    RemoteParticipant,
    Track,
    VideoTrack,
    AudioTrack,
    RemoteTrackPublication,
    RemoteTrack,
    ParticipantEvent
} from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, Monitor, MoreVertical, Crown, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

interface ParticipantVideoProps {
    participant: LocalParticipant | RemoteParticipant;
    isLocal: boolean;
    participantName: string;
    // Props để nhận trạng thái từ component cha (chỉ dành cho local user)
    isMicEnabled?: boolean;
    isCameraEnabled?: boolean;
}

export default function ParticipantVideo({
    participant,
    isLocal,
    participantName,
    isMicEnabled,
    isCameraEnabled
}: ParticipantVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // State cho các trạng thái từ SDK
    const [hasCamera, setHasCamera] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAudioMutedBySDK, setIsAudioMutedBySDK] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    // Quyết định trạng thái cuối cùng để hiển thị trên UI
    // Đối với user local: dùng props từ MeetingInterface
    // Đối với user remote: dùng state được cập nhật từ SDK
    const finalMicState = isLocal ? isMicEnabled : !isAudioMutedBySDK;
    const finalDisplaySource = isScreenSharing || (isLocal ? isCameraEnabled : hasCamera);

    useEffect(() => {
        if (!participant) return;

        const updateTracks = () => {
            const cameraPub = participant.getTrackPublication(Track.Source.Camera);
            const screenSharePub = participant.getTrackPublication(Track.Source.ScreenShare);
            const micPub = participant.getTrackPublication(Track.Source.Microphone);

            // Xác định luồng video để hiển thị (ưu tiên màn hình)
            const screenShareTrack = screenSharePub?.isSubscribed ? screenSharePub.track : null;
            const cameraTrack = cameraPub?.isSubscribed ? cameraPub.track : null;
            const videoTrack = screenShareTrack || cameraTrack;

            // Cập nhật state từ SDK
            setIsScreenSharing(!!screenShareTrack);
            setHasCamera(!!cameraTrack);

            // Gán luồng video vào thẻ <video>
            if (videoRef.current) {
                if (videoTrack) {
                    videoTrack.attach(videoRef.current);
                } else {
                    // Dọn dẹp video cũ nếu không có luồng nào
                    const attachedElements = videoRef.current.srcObject instanceof MediaStream
                        ? (videoRef.current.srcObject as MediaStream).getTracks()
                        : [];
                    attachedElements.forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
            }

            // Xử lý audio cho người dùng remote
            if (!isLocal) {
                setIsAudioMutedBySDK(micPub?.isMuted ?? true);
                if (micPub?.isSubscribed && micPub.track) {
                    const audioTrack = micPub.track as AudioTrack;
                    if (audioRef.current) {
                        audioTrack.attach(audioRef.current);
                    }
                }
            }
        };

        const handleSpeakingChange = (speaking: boolean) => setIsSpeaking(speaking);

        // Lắng nghe các sự kiện để cập nhật lại track
        participant.on(ParticipantEvent.TrackSubscribed, updateTracks);
        participant.on(ParticipantEvent.TrackUnsubscribed, updateTracks);
        participant.on(ParticipantEvent.TrackMuted, updateTracks);
        participant.on(ParticipantEvent.TrackUnmuted, updateTracks);
        participant.on(ParticipantEvent.IsSpeakingChanged, handleSpeakingChange);

        // Chạy lần đầu để lấy trạng thái ban đầu
        updateTracks();

        return () => {
            participant.off(ParticipantEvent.TrackSubscribed, updateTracks);
            participant.off(ParticipantEvent.TrackUnsubscribed, updateTracks);
            participant.off(ParticipantEvent.TrackMuted, updateTracks);
            participant.off(ParticipantEvent.TrackUnmuted, updateTracks);
            participant.off(ParticipantEvent.IsSpeakingChanged, handleSpeakingChange);
        };
    }, [participant, isLocal]);

    const getParticipantInitials = (name: string) => {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    return (
        <TooltipProvider>
            <Card className={`relative bg-gray-900/80 backdrop-blur-sm border-2 overflow-hidden group transition-all duration-300 w-full h-full
                    ${isSpeaking ? 'border-green-400' : 'border-gray-700/50'}
                    ${isPinned ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}`}>
                <div className="w-full h-full relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted={isLocal}
                        playsInline
                        className={`w-full h-full bg-black transition-opacity duration-300
                            ${finalDisplaySource ? 'opacity-100' : 'opacity-0'}
                            ${isScreenSharing ? 'object-contain' : 'object-cover'}`
                        }
                    />

                    {!isLocal && <audio ref={audioRef} autoPlay playsInline className="hidden" />}

                    {!finalDisplaySource && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <Avatar className="w-16 h-16 md:w-24 md:h-24 border-4 border-gray-700">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg md:text-2xl font-bold">
                                    {getParticipantInitials(participantName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-20">
                        <div className="flex flex-col items-start space-y-1.5">
                            {isScreenSharing && (
                                <Badge variant="secondary" className="bg-blue-600/90 text-white border-0 shadow-lg text-xs">
                                    <Monitor className="h-3 w-3 mr-1.5" />
                                    Đang chia sẻ màn hình
                                </Badge>
                            )}
                            {isLocal && (
                                <Badge variant="secondary" className="bg-green-600/90 text-white border-0 shadow-lg text-xs">
                                    <Crown className="h-3 w-3 mr-1.5" />
                                    Bạn
                                </Badge>
                            )}
                            {isPinned && (
                                <Badge variant="secondary" className="bg-yellow-500/90 text-white border-0 shadow-lg text-xs">
                                    <Pin className="h-3 w-3 mr-1.5" />
                                    Đã ghim
                                </Badge>
                            )}
                        </div>

                        {!isLocal && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-1.5 h-auto w-auto bg-black/50 hover:bg-black/70 text-white rounded-full">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsPinned(!isPinned)}>
                                            <Pin className="h-4 w-4 mr-2" />
                                            {isPinned ? 'Bỏ ghim' : 'Ghim video'}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="flex items-end justify-between">
                            <h3 className="text-white font-semibold text-xs md:text-sm truncate pr-2">
                                {participantName}
                            </h3>
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={`p-1 md:p-1.5 rounded-full ${!finalMicState ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                                            {!finalMicState ? <MicOff className="h-2 w-2 md:h-3 md:w-3 text-white" /> : <Mic className="h-2 w-2 md:h-3 md:w-3 text-white" />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{!finalMicState ? 'Micro đã tắt' : 'Micro đang bật'}</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div className={`p-1 md:p-1.5 rounded-full ${!finalDisplaySource ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                                            {!finalDisplaySource ? <VideoOff className="h-2 w-2 md:h-3 md:w-3 text-white" /> : <Video className="h-2 w-2 md:h-3 md:w-3 text-white" />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{!finalDisplaySource ? 'Camera đã tắt' : 'Camera đang bật'}</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
}