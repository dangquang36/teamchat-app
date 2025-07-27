import React, { useState, useEffect, useRef } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication, RemoteTrackPublication, LocalTrackPublication } from 'livekit-client';

interface ParticipantVideoProps {
    participant: LocalParticipant | RemoteParticipant;
    isLocal: boolean;
    callType: 'audio' | 'video';
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant, isLocal, callType }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);

    useEffect(() => {
        if (!participant || !videoRef.current) return;
        const videoEl = videoRef.current;

        const setupVideoTrack = () => {
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);

            if (isLocal) {
                // For local participant
                const localVideoPublication = videoPublication as LocalTrackPublication | undefined;

                // Show video only if it's a video call and camera is enabled
                const shouldShowVideo = callType === 'video' &&
                    participant.isCameraEnabled &&
                    localVideoPublication?.track;

                if (shouldShowVideo && localVideoPublication?.track) {
                    localVideoPublication.track.attach(videoEl);
                    setIsVideoVisible(true);
                    console.log(`✅ Local video track attached for ${participant.identity}, camera enabled: ${participant.isCameraEnabled}`);
                } else {
                    if (localVideoPublication?.track) {
                        localVideoPublication.track.detach(videoEl);
                    }
                    setIsVideoVisible(false);
                    console.log(`❌ Local video hidden for ${participant.identity}, camera enabled: ${participant.isCameraEnabled}, callType: ${callType}`);
                }
            } else {
                // For remote participant
                const remoteVideoPublication = videoPublication as RemoteTrackPublication | undefined;

                // Show video only if it's a video call and remote video is available
                const shouldShowVideo = callType === 'video' &&
                    remoteVideoPublication?.track &&
                    remoteVideoPublication.isSubscribed &&
                    !remoteVideoPublication.isMuted;

                if (shouldShowVideo && remoteVideoPublication?.track) {
                    remoteVideoPublication.track.attach(videoEl);
                    setIsVideoVisible(true);
                    console.log(`✅ Remote video track attached for ${participant.identity}, subscribed: ${remoteVideoPublication.isSubscribed}, muted: ${remoteVideoPublication.isMuted}`);
                } else {
                    if (remoteVideoPublication?.track) {
                        remoteVideoPublication.track.detach(videoEl);
                    }
                    setIsVideoVisible(false);
                    console.log(`❌ Remote video hidden for ${participant.identity}, callType: ${callType}, track exists: ${!!remoteVideoPublication?.track}, subscribed: ${remoteVideoPublication?.isSubscribed}, muted: ${remoteVideoPublication?.isMuted}`);
                }
            }
        };

        const handleMuteChange = () => {
            const audioPublication = participant.getTrackPublication(Track.Source.Microphone);
            setIsMuted(!!audioPublication?.isMuted);
            setupVideoTrack();
        };

        const handleTrackChange = () => {
            console.log(`🔄 Track change for ${participant.identity} (${isLocal ? 'local' : 'remote'})`);
            setupVideoTrack();
        };

        // Initial setup
        setupVideoTrack();
        handleMuteChange();

        // Event listeners
        const eventHandlers: Record<string, (...args: any[]) => void> = {
            trackPublished: handleTrackChange,
            trackSubscribed: handleTrackChange,
            trackUnpublished: handleTrackChange,
            trackUnsubscribed: handleTrackChange,
            trackMuted: handleMuteChange,
            trackUnmuted: handleMuteChange,
        };

        // For remote participants, add subscription events
        if (!isLocal) {
            const additionalEvents: Record<string, (...args: any[]) => void> = {
                trackSubscriptionPermissionChanged: handleTrackChange,
                trackStreamStateChanged: handleTrackChange,
            };
            Object.assign(eventHandlers, additionalEvents);
        }

        // Polling to ensure track state updates
        let checkInterval: NodeJS.Timeout | null = null;
        checkInterval = setInterval(() => {
            setupVideoTrack();
        }, isLocal ? 500 : 1000);

        setTimeout(() => {
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
            }
        }, isLocal ? 5000 : 10000);

        // Attach event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            (participant as any).on(event, handler);
        });

        return () => {
            // Clear interval
            if (checkInterval) {
                clearInterval(checkInterval);
            }

            // Remove event listeners
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                (participant as any).off(event, handler);
            });

            // Detach video track
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);
            if (videoPublication?.track) {
                videoPublication.track.detach(videoEl);
            }
        };
    }, [participant, isLocal, callType]);

    return (
        <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
            {/* Video element - only show for video calls */}
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

            {/* Avatar placeholder - show when no video or audio call */}
            {(!isVideoVisible || callType === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className={`bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl ${callType === 'audio' ? 'w-32 h-32' : 'w-16 h-16'
                            }`}>
                            {callType === 'audio' ? (
                                // Show user avatar or initials for audio calls
                                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">
                                        {participant.identity.replace(/caller_|receiver_/, '').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            ) : (
                                // Show user icon for video calls without video
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        {callType === 'audio' && (
                            <>
                                <p className="text-xl font-semibold mb-2">
                                    {participant.identity.replace(/caller_|receiver_/, '')}
                                    {isLocal && ' (Tôi)'}
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                                    <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                                    <span>{isMuted ? 'Đã tắt mic' : 'Đang nói'}</span>
                                </div>
                            </>
                        )}

                        {callType === 'video' && (
                            <>
                                <p className="text-sm font-medium">
                                    {participant.identity.replace(/caller_|receiver_/, '')}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Camera đang tắt
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Participant name overlay - chỉ hiển thị cho video calls */}
            {callType === 'video' && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {participant.identity.replace(/caller_|receiver_/, '')} {isLocal && '(Tôi)'}
                </div>
            )}

            {/* Audio mute indicator */}
            {isMuted && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Call type indicator - chỉ hiển thị cho video calls */}
            {callType === 'video' && (
                <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-blue-500/80 text-white">
                    📹 Video
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
}

const CallInterface: React.FC<CallInterfaceProps> = ({
    room,
    localParticipant,
    remoteParticipants,
    onEndCall,
    autoEndMessage,
    callEndReason,
    callType = 'video'
}) => {
    const [isMuted, setIsMuted] = useState(true); // Start with muted = true (mic OFF initially)
    const [isVideoOff, setIsVideoOff] = useState(callType === 'audio'); // Video off for audio calls
    const [participants, setParticipants] = useState<RemoteParticipant[]>(remoteParticipants);
    const [remoteVideoKey, setRemoteVideoKey] = useState(0);
    const [showAutoEndNotification, setShowAutoEndNotification] = useState(false);
    const [showCallEndOverlay, setShowCallEndOverlay] = useState(false);
    const [callDuration, setCallDuration] = useState<string>('00:00');

    // Track call duration
    useEffect(() => {
        if (participants.length > 0) {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [participants.length]);

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
        setRemoteVideoKey(prev => prev + 1);
    }, [remoteParticipants]);

    // Track local participant state changes
    useEffect(() => {
        if (!localParticipant) return;

        const updateLocalParticipantState = () => {
            const micEnabled = localParticipant.isMicrophoneEnabled;
            const cameraEnabled = localParticipant.isCameraEnabled;

            // Update states based on actual hardware state
            setIsMuted(!micEnabled);

            // For audio calls, always keep video off
            if (callType === 'audio') {
                setIsVideoOff(true);
            } else {
                setIsVideoOff(!cameraEnabled);
            }

            console.log(`🎤 Mic enabled: ${micEnabled}, isMuted state: ${!micEnabled}`);
            console.log(`🎥 Camera enabled: ${cameraEnabled}, isVideoOff state: ${!cameraEnabled}, callType: ${callType}`);
        };

        updateLocalParticipantState();

        const handleTrackMuted = (publication: TrackPublication) => {
            console.log('Track muted:', publication.source);
            setTimeout(updateLocalParticipantState, 50);
        };

        const handleTrackUnmuted = (publication: TrackPublication) => {
            console.log('Track unmuted:', publication.source);
            setTimeout(updateLocalParticipantState, 50);
        };

        const handleTrackPublished = (publication: TrackPublication) => {
            console.log('Track published:', publication.source);
            setTimeout(updateLocalParticipantState, 50);
        };

        const handleTrackUnpublished = (publication: TrackPublication) => {
            console.log('Track unpublished:', publication.source);
            setTimeout(updateLocalParticipantState, 50);
        };

        // Add event listeners
        (localParticipant as any).on('trackMuted', handleTrackMuted);
        (localParticipant as any).on('trackUnmuted', handleTrackUnmuted);
        (localParticipant as any).on('trackPublished', handleTrackPublished);
        (localParticipant as any).on('trackUnpublished', handleTrackUnpublished);

        const interval = setInterval(updateLocalParticipantState, 500);

        return () => {
            clearInterval(interval);
            (localParticipant as any).off('trackMuted', handleTrackMuted);
            (localParticipant as any).off('trackUnmuted', handleTrackUnmuted);
            (localParticipant as any).off('trackPublished', handleTrackPublished);
            (localParticipant as any).off('trackUnpublished', handleTrackUnpublished);
        };
    }, [localParticipant, callType]);

    const toggleMute = async () => {
        try {
            if (!localParticipant) {
                console.error('❌ Local participant not available');
                return;
            }

            const currentMicState = localParticipant.isMicrophoneEnabled;
            console.log(`🎤 Current mic state: ${currentMicState}, toggling to: ${!currentMicState}`);

            await localParticipant.setMicrophoneEnabled(!currentMicState);

            const newMicState = localParticipant.isMicrophoneEnabled;
            setIsMuted(!newMicState);

            console.log(`🎤 Microphone ${newMicState ? 'enabled' : 'disabled'}, UI state isMuted: ${!newMicState}`);
        } catch (error) {
            console.error('❌ Error toggling microphone:', error);
        }
    };

    const toggleVideo = async () => {
        try {
            if (!localParticipant) {
                console.error('❌ Local participant not available');
                return;
            }

            // Don't allow video toggle for audio calls
            if (callType === 'audio') {
                console.log('🎥 Video toggle disabled for audio calls');
                return;
            }

            const currentCameraState = localParticipant.isCameraEnabled;
            console.log(`🎥 Current camera state: ${currentCameraState}, toggling to: ${!currentCameraState}`);

            await localParticipant.setCameraEnabled(!currentCameraState);

            const newCameraState = localParticipant.isCameraEnabled;
            setIsVideoOff(!newCameraState);

            console.log(`🎥 Camera ${newCameraState ? 'enabled' : 'disabled'}, UI state isVideoOff: ${!newCameraState}`);
        } catch (error) {
            console.error('❌ Error toggling camera:', error);
        }
    };

    const remoteParticipant = participants[0];

    // Safety check
    if (!localParticipant) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="text-center text-white">
                    <p className="text-lg">Đang khởi tạo cuộc gọi...</p>
                </div>
            </div>
        );
    }

    // Call End Overlay
    if (showCallEndOverlay && callEndReason) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center z-50">
                <div className="text-center text-white animate-fade-in">
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                            {callType === 'audio' ? (
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Cuộc gọi {callType === 'audio' ? 'thoại' : 'video'} đã kết thúc
                        </h2>
                        <p className="text-lg text-gray-300 mb-2">{callEndReason}</p>
                        {callDuration !== '00:00' && (
                            <p className="text-sm text-gray-400">Thời gian: {callDuration}</p>
                        )}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <div className="animate-bounce">●</div>
                        <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</div>
                        <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</div>
                        <span className="ml-2">Đang trở về chat...</span>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black flex flex-col z-50">
            {/* Auto End Notification */}
            {showAutoEndNotification && autoEndMessage && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60 max-w-md">
                    <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-pulse">
                        <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{autoEndMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowAutoEndNotification(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Call Type Header */}
            <div className="absolute top-4 left-4 z-10">
                <div className={`px-4 py-2 rounded-lg backdrop-blur-sm border ${callType === 'audio'
                        ? 'bg-green-500/20 border-green-500/30 text-green-300'
                        : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                    }`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        {callType === 'audio' ? (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                Cuộc gọi thoại
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                Cuộc gọi video
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {remoteParticipant ? (
                    <ParticipantVideo
                        key={`remote-${remoteParticipant.identity}-${remoteVideoKey}`}
                        participant={remoteParticipant}
                        isLocal={false}
                        callType={callType}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                        <div className="text-center text-white">
                            {callType === 'audio' ? (
                                <>
                                    <div className="w-40 h-40 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                                        <span className="text-5xl font-bold text-white">
                                            {localParticipant.identity.replace(/caller_|receiver_/, '').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <p className="text-lg text-gray-300">Đang chờ người dùng tham gia...</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-lg mb-2">Đang chờ người dùng tham gia...</p>
                                    <p className="text-sm text-gray-400">Cuộc gọi video</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Local video (Picture-in-picture) - chỉ hiển thị cho video calls */}
                {callType === 'video' && (
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        <ParticipantVideo
                            key={`local-${localParticipant.identity}-${isVideoOff}`}
                            participant={localParticipant}
                            isLocal={true}
                            callType={callType}
                        />
                    </div>
                )}

                {/* Local audio indicator for audio calls */}
                {callType === 'audio' && (
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${isMuted ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-green-500'
                            }`}>
                            <svg className={`w-8 h-8 ${isMuted ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                {isMuted ? (
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                )}
                            </svg>
                        </div>
                        <p className="text-white text-center mt-2 text-sm">
                            {localParticipant.identity.replace(/caller_|receiver_/, '')} (Tôi)
                        </p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4">
                <div className="flex justify-center items-center space-x-4">
                    {/* Microphone Button */}
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isMuted
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
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

                    {/* Camera Button - only show for video calls */}
                    {callType === 'video' && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isVideoOff
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                                : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30'
                                }`}
                            title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isVideoOff ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM1 1l22 22" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                )}
                            </svg>
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        onClick={onEndCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-110 shadow-lg shadow-red-600/40"
                        title="Kết thúc cuộc gọi"
                    >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    </button>
                </div>

                {/* Call duration and type info */}
                <div className="text-center mt-3">
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-white text-sm font-medium">
                            {callDuration}
                        </p>
                        {participants.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-gray-300 text-xs">
                                    {participants[0]?.identity.replace(/caller_|receiver_/, '')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;