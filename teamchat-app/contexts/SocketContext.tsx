'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCall, CallStatus } from '@/hooks/useCall';
import { Room, LocalParticipant, RemoteParticipant } from 'livekit-client';
import IncomingCallModal from '@/components/modals/Call/IncomingCallModal';
import CallInterface from '@/components/chat/VV/CallInterface';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;

    // Direct call functions
    initiateCall: (receiverId: string, receiverName: string, callType?: 'audio' | 'video') => Promise<{ success: boolean; error?: string; roomName?: string }>;
    acceptCall: () => Promise<{ success: boolean; error?: string }>;
    rejectCall: (reason?: 'busy' | 'declined' | 'unavailable') => void;
    endCall: () => Promise<void>;
    isInCall: boolean;
    callStatus: CallStatus;
    callEndReason: string | null;
    callType: 'audio' | 'video';

    // Group call functions
    startGroupCall: (channelId: string, callType: 'audio' | 'video') => void;
    joinGroupCall: (roomName: string, callType: 'audio' | 'video') => Promise<void>;
    leaveGroupCall: (channelId: string) => void;
    isInGroupCall: boolean;
    groupCallRoom: Room | null;
    groupCallParticipants: RemoteParticipant[];
    groupCallLocalParticipant: LocalParticipant | null;
    currentChannelCall: {
        channelId: string;
        channelName: string;
        callType: 'audio' | 'video';
        roomName: string;
    } | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const currentUser = useCurrentUser();

    // Group call states
    const [isInGroupCall, setIsInGroupCall] = useState(false);
    const [groupCallRoom, setGroupCallRoom] = useState<Room | null>(null);
    const [groupCallParticipants, setGroupCallParticipants] = useState<RemoteParticipant[]>([]);
    const [groupCallLocalParticipant, setGroupCallLocalParticipant] = useState<LocalParticipant | null>(null);
    const [currentChannelCall, setCurrentChannelCall] = useState<{
        channelId: string;
        channelName: string;
        callType: 'audio' | 'video';
        roomName: string;
    } | null>(null);

    // Socket initialization
    useEffect(() => {
        if (currentUser?.id) {
            console.log('🔌 Initializing socket for user:', currentUser.name, currentUser.id);

            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
                setIsConnected(true);
                newSocket.emit('join', currentUser.id);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                console.log('🧹 Cleaning up socket connection');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [currentUser?.id]);

    // Direct call hook
    const {
        room: directCallRoom,
        isInCall,
        incomingCall,
        callStatus,
        localParticipant: directCallLocalParticipant,
        remoteParticipants: directCallRemoteParticipants,
        autoEndMessage,
        callEndReason,
        callType,
        callerName,
        receiverName,
        isInitiator,
        initiateCall: originalInitiateCall,
        acceptCall,
        rejectCall,
        endCall
    } = useCall(socket, currentUser?.id || '', currentUser?.name);

    // Group call socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('groupCallStarted', (data: {
            channelId: string;
            callType: 'audio' | 'video';
            roomName: string;
            startedBy: string;
            startedByName: string;
        }) => {
            console.log('📞 Group call started in channel:', data.channelId);
        });

        socket.on('groupCallEnded', (data: { channelId: string }) => {
            console.log('📞 Group call ended in channel:', data.channelId);
            if (currentChannelCall?.channelId === data.channelId) {
                handleLeaveGroupCall();
            }
        });

        return () => {
            socket.off('groupCallStarted');
            socket.off('groupCallEnded');
        };
    }, [socket, currentChannelCall]);

    // Group call functions
    const startGroupCall = (channelId: string, callType: 'audio' | 'video') => {
        if (!socket || !currentUser) return;

        const roomName = `channel-${channelId}-${Date.now()}`;

        socket.emit('startGroupCall', {
            channelId,
            callType,
            roomName,
            startedBy: currentUser.id,
            startedByName: currentUser.name
        });
    };

    const joinGroupCall = async (roomName: string, callType: 'audio' | 'video') => {
        if (!currentUser) return;

        try {
            console.log('🏠 Joining group call room:', roomName);

            const response = await fetch('/api/call/join-group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName,
                    userId: currentUser.id,
                    userName: currentUser.name,
                    callType
                })
            });

            if (!response.ok) {
                throw new Error('Failed to join group call');
            }

            const { token, wsUrl } = await response.json();

            // Create and connect to LiveKit room
            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: callType === 'video' ? {
                    resolution: { width: 1280, height: 720 },
                    facingMode: 'user'
                } : undefined,
                audioCaptureDefaults: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Setup room events
            room.on('connected', () => {
                console.log('✅ Connected to group call room');
                setIsInGroupCall(true);
                setGroupCallLocalParticipant(room.localParticipant);
            });

            room.on('participantConnected', (participant: RemoteParticipant) => {
                console.log('👤 Participant joined group call:', participant.identity);
                setGroupCallParticipants(prev => [...prev, participant]);
            });

            room.on('participantDisconnected', (participant: RemoteParticipant) => {
                console.log('👤 Participant left group call:', participant.identity);
                setGroupCallParticipants(prev =>
                    prev.filter(p => p.identity !== participant.identity)
                );
            });

            room.on('disconnected', () => {
                console.log('❌ Disconnected from group call room');
                handleLeaveGroupCall();
            });

            await room.connect(wsUrl, token);
            setGroupCallRoom(room);

            // Enable media
            await room.localParticipant.setMicrophoneEnabled(true);
            if (callType === 'video') {
                await room.localParticipant.setCameraEnabled(true);
            }

            console.log('✅ Successfully joined group call');

        } catch (error) {
            console.error('❌ Error joining group call:', error);
            throw error;
        }
    };

    const leaveGroupCall = (channelId: string) => {
        if (!socket || !currentUser) return;

        socket.emit('leaveGroupCall', {
            channelId,
            userId: currentUser.id
        });

        handleLeaveGroupCall();
    };

    const handleLeaveGroupCall = () => {
        if (groupCallRoom) {
            groupCallRoom.disconnect();
            setGroupCallRoom(null);
        }
        setIsInGroupCall(false);
        setGroupCallParticipants([]);
        setGroupCallLocalParticipant(null);
        setCurrentChannelCall(null);
    };

    // Enhanced initiateCall wrapper
    const initiateCall = async (receiverId: string, receiverName: string, callType: 'audio' | 'video' = 'video') => {
        console.log(`📞 Initiating ${callType} call from ${currentUser?.name} to ${receiverName}`);

        return await originalInitiateCall(
            receiverId,
            receiverName,
            currentUser?.name || 'Unknown User',
            callType
        );
    };

    // Context value
    const contextValue: SocketContextType = {
        socket,
        isConnected,

        // Direct call functions
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        isInCall,
        callStatus,
        callEndReason,
        callType: callType || 'video',

        // Group call functions
        startGroupCall,
        joinGroupCall,
        leaveGroupCall,
        isInGroupCall,
        groupCallRoom,
        groupCallParticipants,
        groupCallLocalParticipant,
        currentChannelCall
    };

    // Display names for direct calls
    const getDisplayNames = () => {
        if (isInitiator) {
            return {
                localUserName: currentUser?.name || 'Bạn',
                remoteUserName: receiverName || 'Người dùng'
            };
        } else {
            return {
                localUserName: currentUser?.name || 'Bạn',
                remoteUserName: callerName || 'Người dùng'
            };
        }
    };

    const displayNames = getDisplayNames();

    return (
        <SocketContext.Provider value={contextValue}>
            {children}

            {/* Incoming Direct Call Modal */}
            {incomingCall && (
                <IncomingCallModal
                    incomingCall={incomingCall}
                    onAccept={acceptCall}
                    onReject={() => rejectCall('declined')}
                />
            )}

            {/* Direct Call Interface */}
            {isInCall && directCallRoom && directCallLocalParticipant && (
                <CallInterface
                    room={directCallRoom}
                    localParticipant={directCallLocalParticipant}
                    remoteParticipants={directCallRemoteParticipants}
                    onEndCall={endCall}
                    autoEndMessage={autoEndMessage}
                    callEndReason={callEndReason}
                    callType={callType || 'video'}
                    localUserName={displayNames.localUserName}
                    remoteUserName={displayNames.remoteUserName}
                    isInitiator={isInitiator}
                />
            )}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};