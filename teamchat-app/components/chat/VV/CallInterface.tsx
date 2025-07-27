import React, { useState, useEffect, useRef } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication, RemoteTrackPublication, LocalTrackPublication } from 'livekit-client';

interface ParticipantVideoProps {
    participant: LocalParticipant | RemoteParticipant;
    isLocal: boolean;
    callType: 'audio' | 'video';
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant, isLocal, callType }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);

    useEffect(() => {
        if (!participant) return;

        const videoEl = videoRef.current;
        const audioEl = audioRef.current;

        const setupTracks = () => {
            // Setup video track
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);

            // Setup audio track
            const audioPublication = participant.getTrackPublication(Track.Source.Microphone);

            // Handle video
            if (videoEl && callType === 'video') {
                if (isLocal) {
                    const localVideoPublication = videoPublication as LocalTrackPublication | undefined;
                    const shouldShowVideo = participant.isCameraEnabled && localVideoPublication?.track;

                    if (shouldShowVideo && localVideoPublication?.track) {
                        localVideoPublication.track.attach(videoEl);
                        setIsVideoVisible(true);
                    } else {
                        if (localVideoPublication?.track) {
                            localVideoPublication.track.detach(videoEl);
                        }
                        setIsVideoVisible(false);
                    }
                } else {
                    const remoteVideoPublication = videoPublication as RemoteTrackPublication | undefined;
                    const shouldShowVideo = remoteVideoPublication?.track &&
                        remoteVideoPublication.isSubscribed &&
                        !remoteVideoPublication.isMuted;

                    if (shouldShowVideo && remoteVideoPublication?.track) {
                        remoteVideoPublication.track.attach(videoEl);
                        setIsVideoVisible(true);
                    } else {
                        if (remoteVideoPublication?.track) {
                            remoteVideoPublication.track.detach(videoEl);
                        }
                        setIsVideoVisible(false);
                    }
                }
            }

            // Handle audio - chỉ cho remote participants
            if (audioEl && !isLocal) {
                const remoteAudioPublication = audioPublication as RemoteTrackPublication | undefined;

                if (remoteAudioPublication?.track && remoteAudioPublication.isSubscribed) {
                    remoteAudioPublication.track.attach(audioEl);
                    console.log('🔊 Remote audio track attached');
                } else if (remoteAudioPublication?.track) {
                    remoteAudioPublication.track.detach(audioEl);
                    console.log('🔇 Remote audio track detached');
                }
            }

            // Update mute status
            setIsMuted(!!audioPublication?.isMuted);
        };

        setupTracks();

        // Event listeners
        const eventHandlers: Record<string, (...args: any[]) => void> = {
            trackPublished: setupTracks,
            trackSubscribed: setupTracks,
            trackUnpublished: setupTracks,
            trackUnsubscribed: setupTracks,
            trackMuted: setupTracks,
            trackUnmuted: setupTracks,
        };

        if (!isLocal) {
            const additionalEvents: Record<string, (...args: any[]) => void> = {
                trackSubscriptionPermissionChanged: setupTracks,
                trackStreamStateChanged: setupTracks,
            };
            Object.assign(eventHandlers, additionalEvents);
        }

        // Periodic check for track updates
        const checkInterval = setInterval(setupTracks, isLocal ? 500 : 1000);

        // Clean up after some time
        const cleanupTimeout = setTimeout(() => {
            clearInterval(checkInterval);
        }, isLocal ? 5000 : 10000);

        Object.entries(eventHandlers).forEach(([event, handler]) => {
            (participant as any).on(event, handler);
        });

        return () => {
            clearInterval(checkInterval);
            clearTimeout(cleanupTimeout);

            Object.entries(eventHandlers).forEach(([event, handler]) => {
                (participant as any).off(event, handler);
            });

            // Cleanup tracks
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);
            const audioPublication = participant.getTrackPublication(Track.Source.Microphone);

            if (videoPublication?.track && videoEl) {
                videoPublication.track.detach(videoEl);
            }

            if (audioPublication?.track && audioEl && !isLocal) {
                audioPublication.track.detach(audioEl);
            }
        };
    }, [participant, isLocal, callType]);

    return (
        <div className="relative w-full h-full">
            {/* Video element cho video calls */}
            {callType === 'video' && (
                <video
                    ref={videoRef}
                    className={`w-full h-full object-cover ${isVideoVisible ? 'visible' : 'hidden'}`}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
                />
            )}

            {/* Audio element cho remote audio - KHÔNG mute */}
            {!isLocal && (
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                    style={{ display: 'none' }}
                />
            )}

            {/* Audio mute indicator */}
            {isMuted && !isLocal && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Local mute indicator */}
            {isLocal && isMuted && (
                <div className="absolute bottom-2 left-2 bg-red-500 rounded-full p-1.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
    );
};

// ----- Main Call Interface Component -----
interface CallInterfaceProps {
    room: Room;
    localParticipant: LocalParticipant;
    remoteParticipants: RemoteParticipant[];
    onEndCall: () => void;
    autoEndMessage?: string | null;
    callEndReason?: string | null;
    callType?: 'audio' | 'video';
    localUserName: string;
    remoteUserName: string;
    isInitiator?: boolean;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
    room,
    localParticipant,
    remoteParticipants,
    onEndCall,
    autoEndMessage,
    callEndReason,
    callType = 'video',
    localUserName,
    remoteUserName,
    isInitiator = false
}) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
    const [participants, setParticipants] = useState<RemoteParticipant[]>(remoteParticipants);
    const [showAutoEndNotification, setShowAutoEndNotification] = useState(false);
    const [showCallEndOverlay, setShowCallEndOverlay] = useState(false);
    const [callDuration, setCallDuration] = useState<string>('00:00');

    // Track call duration
    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Show call end overlay when call ends with reason
    useEffect(() => {
        if (callEndReason && !participants.length) {
            setShowCallEndOverlay(true);
            const timer = setTimeout(() => {
                setShowCallEndOverlay(false);
                onEndCall();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [callEndReason, participants.length, onEndCall]);

    // Auto end notification
    useEffect(() => {
        if (autoEndMessage) {
            setShowAutoEndNotification(true);
            const timer = setTimeout(() => {
                setShowAutoEndNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [autoEndMessage]);

    // Update participants when remote participants change
    useEffect(() => {
        setParticipants(remoteParticipants);
    }, [remoteParticipants]);

    // Enhanced microphone state tracking
    useEffect(() => {
        if (!localParticipant) return;

        const updateMicrophoneState = () => {
            const micEnabled = localParticipant.isMicrophoneEnabled;
            const cameraEnabled = localParticipant.isCameraEnabled;

            console.log('🎤 Microphone state update:', {
                micEnabled,
                cameraEnabled,
                callType,
                participantId: localParticipant.identity
            });

            setIsMuted(!micEnabled);

            if (callType === 'audio') {
                setIsVideoOff(true);
            } else {
                setIsVideoOff(!cameraEnabled);
            }
        };

        // Initial state
        updateMicrophoneState();

        // Event listeners
        const handleTrackMuted = (publication: TrackPublication) => {
            console.log('🔇 Track muted:', publication.source);
            if (publication.source === Track.Source.Microphone) {
                setTimeout(updateMicrophoneState, 50);
            }
        };

        const handleTrackUnmuted = (publication: TrackPublication) => {
            console.log('🔊 Track unmuted:', publication.source);
            if (publication.source === Track.Source.Microphone) {
                setTimeout(updateMicrophoneState, 50);
            }
        };

        const handleTrackPublished = (publication: TrackPublication) => {
            console.log('📢 Track published:', publication.source);
            setTimeout(updateMicrophoneState, 50);
        };

        const handleTrackUnpublished = (publication: TrackPublication) => {
            console.log('📢 Track unpublished:', publication.source);
            setTimeout(updateMicrophoneState, 50);
        };

        (localParticipant as any).on('trackMuted', handleTrackMuted);
        (localParticipant as any).on('trackUnmuted', handleTrackUnmuted);
        (localParticipant as any).on('trackPublished', handleTrackPublished);
        (localParticipant as any).on('trackUnpublished', handleTrackUnpublished);

        // Periodic state check
        const interval = setInterval(updateMicrophoneState, 1000);

        return () => {
            clearInterval(interval);
            (localParticipant as any).off('trackMuted', handleTrackMuted);
            (localParticipant as any).off('trackUnmuted', handleTrackUnmuted);
            (localParticipant as any).off('trackPublished', handleTrackPublished);
            (localParticipant as any).off('trackUnpublished', handleTrackUnpublished);
        };
    }, [localParticipant, callType]);

    // Enhanced microphone toggle with better error handling
    const toggleMute = async () => {
        try {
            if (!localParticipant) {
                console.error('❌ No local participant available');
                return;
            }

            const currentMicState = localParticipant.isMicrophoneEnabled;
            console.log('🎤 Toggling microphone:', {
                currentState: currentMicState,
                willEnable: !currentMicState
            });

            // Request microphone permission if needed
            if (!currentMicState) {
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                    console.log('🎤 Microphone permission granted');
                } catch (permissionError) {
                    console.error('❌ Microphone permission denied:', permissionError);
                    alert('Cần cấp quyền truy cập microphone để sử dụng tính năng này');
                    return;
                }
            }

            // Toggle microphone
            await localParticipant.setMicrophoneEnabled(!currentMicState);

            // Verify the change
            const newMicState = localParticipant.isMicrophoneEnabled;
            console.log('🎤 Microphone toggle result:', {
                requested: !currentMicState,
                actual: newMicState,
                success: newMicState === !currentMicState
            });

            setIsMuted(!newMicState);

            // Show notification
            if (newMicState) {
                console.log('🔊 Microphone enabled');
            } else {
                console.log('🔇 Microphone disabled');
            }

        } catch (error) {
            console.error('❌ Error toggling microphone:', error);
            alert('Không thể thay đổi trạng thái microphone. Vui lòng thử lại.');
        }
    };

    // Enhanced video toggle
    const toggleVideo = async () => {
        try {
            if (!localParticipant || callType === 'audio') {
                console.log('❌ Video toggle not available:', { localParticipant: !!localParticipant, callType });
                return;
            }

            const currentCameraState = localParticipant.isCameraEnabled;
            console.log('📹 Toggling camera:', {
                currentState: currentCameraState,
                willEnable: !currentCameraState
            });

            // Request camera permission if needed
            if (!currentCameraState) {
                try {
                    await navigator.mediaDevices.getUserMedia({ video: true });
                    console.log('📹 Camera permission granted');
                } catch (permissionError) {
                    console.error('❌ Camera permission denied:', permissionError);
                    alert('Cần cấp quyền truy cập camera để sử dụng tính năng này');
                    return;
                }
            }

            await localParticipant.setCameraEnabled(!currentCameraState);
            const newCameraState = localParticipant.isCameraEnabled;

            console.log('📹 Camera toggle result:', {
                requested: !currentCameraState,
                actual: newCameraState,
                success: newCameraState === !currentCameraState
            });

            setIsVideoOff(!newCameraState);

        } catch (error) {
            console.error('❌ Error toggling camera:', error);
            alert('Không thể thay đổi trạng thái camera. Vui lòng thử lại.');
        }
    };

    const remoteParticipant = participants[0];

    const getCallHeaderTitle = () => {
        if (participants.length > 0) {
            return `${localUserName} và ${remoteUserName}`;
        } else {
            if (isInitiator) {
                return `Đang gọi ${remoteUserName}...`;
            } else {
                return `Cuộc gọi từ ${remoteUserName}`;
            }
        }
    };

    // Safety check
    if (!localParticipant) {
        return (
            <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
                <div className="text-center text-white">
                    <p className="text-lg">Đang khởi tạo cuộc gọi...</p>
                </div>
            </div>
        );
    }

    // Call End Overlay
    if (showCallEndOverlay && callEndReason) {
        return (
            <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
                <div className="text-center text-white">
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Cuộc gọi đã kết thúc
                        </h2>
                        <p className="text-lg text-gray-300">{callEndReason}</p>
                        <p className="text-sm text-gray-400 mt-2">Thời gian: {callDuration}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
            {/* Auto End Notification */}
            {showAutoEndNotification && autoEndMessage && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60 max-w-md">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
                        <p className="text-sm font-medium">{autoEndMessage}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-black/80 backdrop-blur-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-lg">
                                {getCallHeaderTitle()}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>

                <div className="relative h-full flex items-center justify-center">
                    {remoteParticipant && callType === 'video' ? (
                        <ParticipantVideo
                            participant={remoteParticipant}
                            isLocal={false}
                            callType={callType}
                        />
                    ) : (
                        <div className="text-center">
                            <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                                <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>

                            <h3 className="text-white text-xl font-semibold mb-2">
                                {remoteUserName}
                            </h3>

                            {!remoteParticipant && (
                                <div className="flex items-center justify-center space-x-2 text-gray-400">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    <span className="ml-2">
                                        {isInitiator ? 'Đang gọi...' : 'Đang kết nối...'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Local video for video calls */}
                    {callType === 'video' && (
                        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 shadow-lg">
                            <ParticipantVideo
                                participant={localParticipant}
                                isLocal={true}
                                callType={callType}
                            />
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
                                {localUserName}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Controls Bar */}
            <div className="bg-black/90 backdrop-blur-sm p-6">
                <div className="flex justify-center items-center space-x-8">
                    {/* Enhanced Microphone Button */}
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isMuted
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        title={isMuted ? 'Bật mic' : 'Tắt mic'}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMuted ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            )}
                        </svg>
                    </button>

                    {/* Camera toggle (only for video calls) */}
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isVideoOff
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
                        >
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                {isVideoOff ? (
                                    <>
                                        <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
                                    </>
                                ) : (
                                    <>
                                        <rect x="4" y="6" width="12" height="10" rx="2" ry="2" />
                                        <polygon points="17,8.5 21,6.5 21,15.5 17,13.5" />
                                    </>
                                )}
                            </svg>
                        </button>
                    )}

                    {/* End Call */}
                    <button
                        onClick={onEndCall}
                        className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200 transform hover:scale-110"
                        title="Kết thúc cuộc gọi"
                    >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    </button>
                </div>

                {/* Call info với microphone status */}
                <div className="text-center mt-4">
                    <p className="text-gray-400 text-sm">
                        Cuộc gọi {callType === 'audio' ? 'thoại' : 'video'} • {callDuration}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;