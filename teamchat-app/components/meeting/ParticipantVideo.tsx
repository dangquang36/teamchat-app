'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
    const currentVideoTrackRef = useRef<VideoTrack | null>(null);
    const currentAudioTrackRef = useRef<AudioTrack | null>(null);

    // State cho các trạng thái từ SDK
    const [hasCamera, setHasCamera] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAudioMutedBySDK, setIsAudioMutedBySDK] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [videoReady, setVideoReady] = useState(false);

    // Quyết định trạng thái cuối cùng để hiển thị trên UI
    // Đối với user local: dùng props từ MeetingInterface
    // Đối với user remote: dùng state được cập nhật từ SDK
    const finalMicState = isLocal ? isMicEnabled : !isAudioMutedBySDK;
    const finalCameraState = isLocal ? isCameraEnabled : hasCamera;
    const finalDisplaySource = isScreenSharing || finalCameraState;

    // Cleanup function cho video track
    const cleanupVideoTrack = useCallback(() => {
        if (currentVideoTrackRef.current && videoRef.current) {
            try {
                currentVideoTrackRef.current.detach(videoRef.current);
            } catch (error) {
                console.warn('Error detaching video track:', error);
            }
        }
        currentVideoTrackRef.current = null;
        setVideoReady(false);
    }, []);

    // Cleanup function cho audio track
    const cleanupAudioTrack = useCallback(() => {
        if (currentAudioTrackRef.current && audioRef.current) {
            try {
                currentAudioTrackRef.current.detach(audioRef.current);
            } catch (error) {
                console.warn('Error detaching audio track:', error);
            }
        }
        currentAudioTrackRef.current = null;
    }, []);

    // Attach video track với retry mechanism
    const attachVideoTrack = useCallback((videoTrack: VideoTrack) => {
        if (!videoRef.current) return;

        // Cleanup previous track first
        cleanupVideoTrack();

        try {
            // Small delay to ensure cleanup is complete
            setTimeout(() => {
                if (videoRef.current && videoTrack) {
                    videoTrack.attach(videoRef.current);
                    currentVideoTrackRef.current = videoTrack;
                    setVideoReady(true);

                    // Ensure video plays
                    const videoElement = videoRef.current;
                    videoElement.play().catch(e => {
                        console.warn('Auto-play failed:', e);
                    });
                }
            }, 50);
        } catch (error) {
            console.error('Error attaching video track:', error);
            setVideoReady(false);
        }
    }, [cleanupVideoTrack]);

    // Attach audio track
    const attachAudioTrack = useCallback((audioTrack: AudioTrack) => {
        if (!audioRef.current || isLocal) return;

        // Cleanup previous track first
        cleanupAudioTrack();

        try {
            setTimeout(() => {
                if (audioRef.current && audioTrack) {
                    audioTrack.attach(audioRef.current);
                    currentAudioTrackRef.current = audioTrack;
                }
            }, 50);
        } catch (error) {
            console.error('Error attaching audio track:', error);
        }
    }, [cleanupAudioTrack, isLocal]);

    // Update tracks function với improved logic
    const updateTracks = useCallback(() => {
        if (!participant) return;

        const cameraPub = participant.getTrackPublication(Track.Source.Camera);
        const screenSharePub = participant.getTrackPublication(Track.Source.ScreenShare);
        const micPub = participant.getTrackPublication(Track.Source.Microphone);

        // Xác định luồng video để hiển thị (ưu tiên màn hình)
        const screenShareTrack = screenSharePub?.isSubscribed ? screenSharePub.track as VideoTrack : null;
        const cameraTrack = cameraPub?.isSubscribed ? cameraPub.track as VideoTrack : null;
        const preferredVideoTrack = screenShareTrack || cameraTrack;

        // Cập nhật state từ SDK
        const newIsScreenSharing = !!screenShareTrack;
        const newHasCamera = !!cameraTrack;

        setIsScreenSharing(newIsScreenSharing);
        setHasCamera(newHasCamera);

        // Chỉ attach video track khi có thay đổi thực sự
        if (preferredVideoTrack !== currentVideoTrackRef.current) {
            if (preferredVideoTrack) {
                attachVideoTrack(preferredVideoTrack);
            } else {
                cleanupVideoTrack();
            }
        }

        // Xử lý audio cho người dùng remote
        if (!isLocal) {
            const newIsAudioMuted = micPub?.isMuted ?? true;
            setIsAudioMutedBySDK(newIsAudioMuted);

            if (micPub?.isSubscribed && micPub.track) {
                const audioTrack = micPub.track as AudioTrack;
                if (audioTrack !== currentAudioTrackRef.current) {
                    attachAudioTrack(audioTrack);
                }
            } else {
                cleanupAudioTrack();
            }
        }
    }, [participant, attachVideoTrack, attachAudioTrack, cleanupVideoTrack, cleanupAudioTrack, isLocal]);

    // Effect để xử lý participant events
    useEffect(() => {
        if (!participant) return;

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
    }, [participant, updateTracks]);

    // Effect để xử lý local participant state changes
    useEffect(() => {
        if (isLocal && participant) {
            // Đối với local participant, cập nhật tracks khi state thay đổi
            updateTracks();
        }
    }, [isLocal, isCameraEnabled, participant, updateTracks]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            cleanupVideoTrack();
            cleanupAudioTrack();
        };
    }, [cleanupVideoTrack, cleanupAudioTrack]);

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
                            ${finalDisplaySource && videoReady ? 'opacity-100' : 'opacity-0'}
                            ${isScreenSharing ? 'object-contain' : 'object-cover'}`
                        }
                        onLoadedData={() => {
                            // Ensure video starts playing when loaded
                            if (videoRef.current) {
                                videoRef.current.play().catch(e => {
                                    console.warn('Video play failed:', e);
                                });
                            }
                        }}
                    />

                    {!isLocal && <audio ref={audioRef} autoPlay playsInline className="hidden" />}

                    {(!finalDisplaySource || !videoReady) && (
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
                                        <div className={`p-1 md:p-1.5 rounded-full ${!finalCameraState ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                                            {!finalCameraState ? <VideoOff className="h-2 w-2 md:h-3 md:w-3 text-white" /> : <Video className="h-2 w-2 md:h-3 md:w-3 text-white" />}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{!finalCameraState ? 'Camera đã tắt' : 'Camera đang bật'}</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
}