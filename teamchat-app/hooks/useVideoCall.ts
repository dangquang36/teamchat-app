'use client';

import { useState, useCallback } from 'react';
import { VideoCallState } from '../lib/src/types/videocall';

export const useVideoCall = () => {
    const [room, setRoom] = useState<any>(null);
    const [callState, setCallState] = useState<VideoCallState>({
        isConnected: false,
        isAudioEnabled: true,
        isVideoEnabled: true,
        participants: [],
        currentRoom: null,
    });

    const connectToRoom = useCallback(async (roomName: string, participantName: string) => {
        try {
            console.log('🔄 Connecting to room:', roomName, 'as:', participantName);

            const response = await fetch('/api/videocall/join-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomName, participantName }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 API Response:', data);

            if (data.success) {
                // Import động LiveKit
                const { Room } = await import('livekit-client');
                const newRoom = new Room();

                // Lắng nghe sự kiện kết nối
                newRoom.on('connected', () => {
                    console.log('✅ Room connected successfully');
                    setCallState(prev => ({
                        ...prev,
                        isConnected: true,
                        currentRoom: roomName,
                    }));
                    updateParticipants(newRoom);
                });

                newRoom.on('participantConnected', (participant: any) => {
                    console.log('👤 Participant connected:', participant.identity);
                    updateParticipants(newRoom);
                });

                newRoom.on('participantDisconnected', (participant: any) => {
                    console.log('👤 Participant disconnected:', participant.identity);
                    updateParticipants(newRoom);
                });

                newRoom.on('disconnected', (reason?: any) => {
                    console.log('❌ Room disconnected. Reason:', reason);
                });

                newRoom.on('reconnected', () => {
                    console.log('🔄 Room reconnected');
                    setCallState(prev => ({
                        ...prev,
                        isConnected: true,
                    }));
                });

                // Kết nối đến room
                await newRoom.connect(data.livekitUrl, data.token);
                setRoom(newRoom);

                console.log('🎉 Successfully connected to LiveKit room');
            } else {
                console.error('❌ API returned error:', data.error);
            }
        } catch (error) {
            console.error('💥 Error connecting to room:', error);
        }
    }, []);

    const updateParticipants = (room: any) => {
        const participants = Array.from(room.participants.values()).map((p: any) => p.identity);
        if (room.localParticipant) {
            participants.push(room.localParticipant.identity);
        }

        console.log('👥 Participants updated:', participants);
        setCallState(prev => ({
            ...prev,
            participants,
        }));
    };

    const disconnectFromRoom = useCallback(() => {
        if (room) {
            console.log('🔌 Manually disconnecting from room');
            room.disconnect();
            setRoom(null);
            setCallState(prev => ({
                ...prev,
                isConnected: false,
                currentRoom: null,
                participants: [],
            }));
        }
    }, [room]);

    const toggleAudio = useCallback(async () => {
        if (room && room.localParticipant) {
            try {
                const enabled = !callState.isAudioEnabled;
                await room.localParticipant.setMicrophoneEnabled(enabled);
                setCallState(prev => ({
                    ...prev,
                    isAudioEnabled: enabled,
                }));
                console.log('🎤 Audio toggled:', enabled);
            } catch (error) {
                console.error('Error toggling audio:', error);
            }
        }
    }, [room, callState.isAudioEnabled]);

    const toggleVideo = useCallback(async () => {
        if (room && room.localParticipant) {
            try {
                const enabled = !callState.isVideoEnabled;
                await room.localParticipant.setCameraEnabled(enabled);
                setCallState(prev => ({
                    ...prev,
                    isVideoEnabled: enabled,
                }));
                console.log('📹 Video toggled:', enabled);
            } catch (error) {
                console.error('Error toggling video:', error);
            }
        }
    }, [room, callState.isVideoEnabled]);

    return {
        room,
        callState,
        connectToRoom,
        disconnectFromRoom,
        toggleAudio,
        toggleVideo,
    };
};