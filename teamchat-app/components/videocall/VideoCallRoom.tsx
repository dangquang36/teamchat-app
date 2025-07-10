'use client';

import React, { useEffect, useRef } from 'react';
import { ParticipantView } from './ParticipantView';
import { CallControls } from './CallControls';
import { useVideoCall } from '@/hooks/useVideoCall';

interface VideoCallRoomProps {
    roomName: string;
    participantName: string;
    onLeave?: () => void;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
    roomName,
    participantName,
    onLeave,
}) => {
    const { room, callState, connectToRoom, disconnectFromRoom, toggleAudio, toggleVideo } = useVideoCall();
    const hasConnected = useRef(false);

    useEffect(() => {
        if (!hasConnected.current && roomName && participantName) {
            console.log('🔄 VideoCallRoom: Connecting to room:', roomName);
            connectToRoom(roomName, participantName);
            hasConnected.current = true;
        }

        return () => {
            if (hasConnected.current) {
                console.log('🔌 VideoCallRoom: Cleanup - disconnecting');
                disconnectFromRoom();
            }
        };
    }, [roomName, participantName, connectToRoom, disconnectFromRoom]);

    const handleLeave = () => {
        console.log('👋 VideoCallRoom: Leaving room');
        disconnectFromRoom();
        onLeave?.();
    };

    if (!callState.isConnected) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang kết nối tới LiveKit...</p>
                    <p className="text-sm text-gray-500 mt-2">Room: {roomName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-800 border-b border-gray-700">
                <h3 className="text-white font-semibold">LiveKit Room: {roomName}</h3>
                <p className="text-gray-400 text-sm">
                    {callState.participants.length} người tham gia
                </p>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {room && (
                        <>
                            {/* Local Participant */}
                            {room.localParticipant && (
                                <ParticipantView
                                    participant={room.localParticipant}
                                    isLocal={true}
                                />
                            )}

                            {/* Remote Participants */}
                            {room.participants && Array.from(room.participants.values()).map((participant: any) => (
                                <ParticipantView
                                    key={participant.identity}
                                    participant={participant}
                                    isLocal={false}
                                />
                            ))}
                        </>
                    )}
                </div>

                <CallControls
                    isAudioEnabled={callState.isAudioEnabled}
                    isVideoEnabled={callState.isVideoEnabled}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    onLeave={handleLeave}
                />
            </div>
        </div>
    );
};