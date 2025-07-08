'use client';

import React, { useEffect, useRef } from 'react';

interface ParticipantViewProps {
    participant: any;  // Dùng any để tránh lỗi TypeScript
    isLocal: boolean;
}

export const ParticipantView: React.FC<ParticipantViewProps> = ({ participant, isLocal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!participant) return;

        const setupTracks = async () => {
            try {
                console.log('🎥 Setting up tracks for:', participant.identity);

                // Import động Track từ livekit-client
                const { Track } = await import('livekit-client');

                const videoTrack = participant.getTrack?.(Track.Source.Camera);
                const audioTrack = participant.getTrack?.(Track.Source.Microphone);

                if (videoTrack && videoRef.current) {
                    videoTrack.attach(videoRef.current);
                    console.log('📹 Video track attached for:', participant.identity);
                }

                if (audioTrack && audioRef.current && !isLocal) {
                    audioTrack.attach(audioRef.current);
                    console.log('🔊 Audio track attached for:', participant.identity);
                }
            } catch (error) {
                console.error('Error setting up tracks:', error);
            }
        };

        setupTracks();

        return () => {
            // Cleanup tracks
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            if (audioRef.current) {
                audioRef.current.srcObject = null;
            }
        };
    }, [participant, isLocal]);

    if (!participant) {
        return (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white">
                    <p className="text-sm">No participant</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className="w-full h-full object-cover"
            />
            {!isLocal && <audio ref={audioRef} autoPlay />}

            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {isLocal ? 'Bạn' : participant?.identity || 'Unknown'}
            </div>

            {/* Fallback khi không có video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700 text-white">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold">
                            {participant?.identity?.charAt(0) || '?'}
                        </span>
                    </div>
                    <p className="text-sm">{participant?.identity || 'Loading...'}</p>
                </div>
            </div>
        </div>
    );
};