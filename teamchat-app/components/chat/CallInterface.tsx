import React, { useState, useEffect, useRef } from 'react';
import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication, RemoteTrackPublication, LocalTrackPublication } from 'livekit-client';

interface ParticipantVideoProps {
    participant: LocalParticipant | RemoteParticipant;
    isLocal: boolean;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant, isLocal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);

    useEffect(() => {
        if (!participant || !videoRef.current) return;
        const videoEl = videoRef.current;

        const setupVideoTrack = () => {
            // Fix: Sử dụng getTrackPublication thay vì getTrack
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);

            if (isLocal) {
                // For local participant, check if camera is enabled
                const localVideoPublication = videoPublication as LocalTrackPublication | undefined;
                const shouldShowVideo = participant.isCameraEnabled && localVideoPublication?.track;

                if (shouldShowVideo && localVideoPublication?.track) {
                    localVideoPublication.track.attach(videoEl);
                    setIsVideoVisible(true);
                    console.log(`✅ Local video track attached for ${participant.identity}, camera enabled: ${participant.isCameraEnabled}`);
                } else {
                    if (localVideoPublication?.track) {
                        localVideoPublication.track.detach(videoEl);
                    }
                    setIsVideoVisible(false);
                    console.log(`❌ Local video hidden for ${participant.identity}, camera enabled: ${participant.isCameraEnabled}`);
                }
            } else {
                // For remote participant, check if track exists and is subscribed
                const remoteVideoPublication = videoPublication as RemoteTrackPublication | undefined;
                const shouldShowVideo = remoteVideoPublication?.track &&
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
                    console.log(`❌ Remote video hidden for ${participant.identity}, track exists: ${!!remoteVideoPublication?.track}, subscribed: ${remoteVideoPublication?.isSubscribed}, muted: ${remoteVideoPublication?.isMuted}`);
                }
            }
        };

        const handleMuteChange = () => {
            // Fix: Sử dụng getTrackPublication thay vì getTrack
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

        // Event listeners with proper typing
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

        // Attach event listeners with proper typing
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            (participant as any).on(event, handler);
        });

        return () => {
            // Clear interval
            if (checkInterval) {
                clearInterval(checkInterval);
            }

            // Remove event listeners with proper typing
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                (participant as any).off(event, handler);
            });

            // Detach video track
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);
            if (videoPublication?.track) {
                videoPublication.track.detach(videoEl);
            }
        };
    }, [participant, isLocal]);

    return (
        <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
            <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isVideoVisible ? 'visible' : 'hidden'}`}
                autoPlay
                playsInline
                muted={isLocal}
                style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
            />

            {!isVideoVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">
                            {participant.identity.replace(/caller_|receiver_/, '')}
                        </p>
                        <p className="text-xs text-gray-400">Camera đang tắt</p>
                    </div>
                </div>
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {participant.identity.replace(/caller_|receiver_/, '')} {isLocal && '(Tôi)'}
            </div>

            {/* Audio mute indicator */}
            {isMuted && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1.5">
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
}

const CallInterface: React.FC<CallInterfaceProps> = ({
    room,
    localParticipant,
    remoteParticipants,
    onEndCall,
    autoEndMessage,
    callEndReason
}) => {
    const [isMuted, setIsMuted] = useState(true); // Start with muted = true (mic OFF initially)
    const [isVideoOff, setIsVideoOff] = useState(true); // Start with video OFF initially
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

    // Hiển thị thông báo auto end
    useEffect(() => {
        if (autoEndMessage) {
            setShowAutoEndNotification(true);
            // Tự động ẩn thông báo sau 5 giây
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
            setIsMuted(!micEnabled); // isMuted = true when mic is disabled
            setIsVideoOff(!cameraEnabled); // isVideoOff = true when camera is disabled

            console.log(`🎤 Mic enabled: ${micEnabled}, isMuted state: ${!micEnabled}`);
            console.log(`🎥 Camera enabled: ${cameraEnabled}, isVideoOff state: ${!cameraEnabled}`);
        };

        // Set initial state immediately
        updateLocalParticipantState();

        // Event handlers with proper typing
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

        // Add event listeners with proper typing
        (localParticipant as any).on('trackMuted', handleTrackMuted);
        (localParticipant as any).on('trackUnmuted', handleTrackUnmuted);
        (localParticipant as any).on('trackPublished', handleTrackPublished);
        (localParticipant as any).on('trackUnpublished', handleTrackUnpublished);

        // Also poll every 500ms to ensure sync
        const interval = setInterval(updateLocalParticipantState, 500);

        return () => {
            clearInterval(interval);
            // Remove event listeners with proper typing
            (localParticipant as any).off('trackMuted', handleTrackMuted);
            (localParticipant as any).off('trackUnmuted', handleTrackUnmuted);
            (localParticipant as any).off('trackPublished', handleTrackPublished);
            (localParticipant as any).off('trackUnpublished', handleTrackUnpublished);
        };
    }, [localParticipant]);

    const toggleMute = async () => {
        try {
            if (!localParticipant) {
                console.error('❌ Local participant not available');
                return;
            }

            const currentMicState = localParticipant.isMicrophoneEnabled;
            console.log(`🎤 Current mic state: ${currentMicState}, toggling to: ${!currentMicState}`);

            await localParticipant.setMicrophoneEnabled(!currentMicState);

            // Update state immediately after the call
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

            const currentCameraState = localParticipant.isCameraEnabled;
            console.log(`🎥 Current camera state: ${currentCameraState}, toggling to: ${!currentCameraState}`);

            await localParticipant.setCameraEnabled(!currentCameraState);

            // Update state immediately after the call
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
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Cuộc gọi đã kết thúc</h2>
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

            {/* Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {remoteParticipant ? (
                    <ParticipantVideo
                        key={`remote-${remoteParticipant.identity}-${remoteVideoKey}`}
                        participant={remoteParticipant}
                        isLocal={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                            <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>

                        </div>
                    </div>
                )}

                {/* Local video (Picture-in-picture) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                    <ParticipantVideo
                        key={`local-${localParticipant.identity}-${isVideoOff}`}
                        participant={localParticipant}
                        isLocal={true}
                    />
                </div>


            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4">
                <div className="flex justify-center items-center space-x-4">
                    {/* Microphone Button */}
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isMuted
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' // Red when muted (mic OFF)
                            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30' // Green when not muted (mic ON)
                            }`}
                        title={isMuted ? 'Bật mic' : 'Tắt mic'}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMuted ? (
                                // Show muted icon when isMuted = true
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            ) : (
                                // Show normal mic icon when isMuted = false
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            )}
                        </svg>
                    </button>

                    {/* Camera Button */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${isVideoOff
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' // Red when video is off
                            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30' // Green when video is on
                            }`}
                        title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isVideoOff ? (
                                // Show video off icon when isVideoOff = true
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM1 1l22 22" />
                            ) : (
                                // Show normal video icon when isVideoOff = false
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            )}
                        </svg>
                    </button>

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


            </div>
        </div>
    );
};

export default CallInterface;