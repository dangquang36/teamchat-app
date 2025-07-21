'use client';

import React, { useEffect, useRef } from 'react';
import { ParticipantView } from './ParticipantView';
import { CallControls } from './CallControls';
import { useVideoCall } from '@/hooks/useVideoCall';
import { useTheme } from '@/contexts/ThemeContext';

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
    const { isDarkMode } = useTheme(); // ✅ 2. Lấy trạng thái sáng/tối
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

    // Giao diện khi đang kết nối
    if (!callState.isConnected) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                    <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Đang kết nối tới LiveKit...</p>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Room: {roomName}</p>
                </div>
            </div>
        );
    }

    // Giao diện chính của cuộc gọi
    return (
        <div className={`h-full flex flex-col rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LiveKit Room: {roomName}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {callState.participants.length} người tham gia
                </p>
            </div>

            {/* Lưới hiển thị người tham gia */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
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
                        {Array.from(room.participants.values()).map((participant: any) => (
                            <ParticipantView
                                key={participant.identity}
                                participant={participant}
                                isLocal={false}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Thanh điều khiển */}
            <div className="p-4">
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
