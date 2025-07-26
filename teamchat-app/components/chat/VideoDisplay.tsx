import React, { useRef, useEffect } from 'react';
import { LocalParticipant, RemoteParticipant } from 'livekit-client';
import { useVideoTracks } from '@/hooks/useVideoTracks';

interface VideoDisplayProps {
    participant: LocalParticipant | RemoteParticipant;
    isLocal: boolean;
    className?: string;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ participant, isLocal, className = "" }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoState = useVideoTracks(participant, isLocal);

    useEffect(() => {
        if (!videoRef.current || !videoState.trackPublication) return;

        const videoEl = videoRef.current;
        const track = videoState.trackPublication.track;

        if (videoState.hasVideo && track) {
            track.attach(videoEl);
            console.log(`✅ Video attached for ${participant.identity} (${isLocal ? 'local' : 'remote'})`);
        } else {
            track?.detach(videoEl);
            console.log(`❌ Video detached for ${participant.identity} (${isLocal ? 'local' : 'remote'})`);
        }

        return () => {
            track?.detach(videoEl);
        };
    }, [videoState.hasVideo, videoState.trackPublication, participant.identity, isLocal]);

    return (
        <div className={`relative w-full h-full bg-gray-800 flex items-center justify-center ${className}`}>
            <video
                ref={videoRef}
                className={`w-full h-full object-cover ${videoState.hasVideo ? 'visible' : 'hidden'}`}
                autoPlay
                playsInline
                muted={isLocal}
                style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
            />

            {!videoState.hasVideo && (
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
                        <p className="text-xs text-gray-400">
                            {isLocal ? 'Camera đang tắt' :
                                !videoState.isSubscribed ? 'Đang kết nối...' : 'Camera đang tắt'}
                        </p>
                    </div>
                </div>
            )}

            {/* Participant name overlay */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {participant.identity.replace(/caller_|receiver_/, '')} {isLocal && '(Tôi)'}
            </div>

            {/* Audio mute indicator */}
            {!isLocal && !participant.isMicrophoneEnabled && (
                <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Video state indicator for debugging */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
                    {isLocal ? 'L' : 'R'}: {videoState.hasVideo ? '✓' : '✗'} |
                    Sub: {videoState.isSubscribed ? '✓' : '✗'} |
                    Mute: {videoState.isMuted ? '✓' : '✗'}
                </div>
            )}
        </div>
    );
};

export default VideoDisplay;