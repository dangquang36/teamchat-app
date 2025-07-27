'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCall, CallStatus } from '@/hooks/useCall';
import IncomingCallModal from '@/components/modals/Call/IncomingCallModal';
import CallInterface from '@/components/chat/VV/CallInterface';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    initiateCall: (receiverId: string, receiverName: string, callType?: 'audio' | 'video') => Promise<{ success: boolean; error?: string; roomName?: string }>;
    acceptCall: () => Promise<{ success: boolean; error?: string }>;
    rejectCall: (reason?: 'busy' | 'declined' | 'unavailable') => void;
    endCall: () => Promise<void>;
    isInCall: boolean;
    callStatus: CallStatus;
    callEndReason: string | null;
    callType: 'audio' | 'video';
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

    // Call hook with proper user info
    const {
        room,
        isInCall,
        incomingCall,
        callStatus,
        localParticipant,
        remoteParticipants,
        autoEndMessage,
        callEndReason,
        callType,
        callerName,
        receiverName,
        remoteUserName,
        isInitiator,
        initiateCall: originalInitiateCall,
        acceptCall,
        rejectCall,
        endCall
    } = useCall(socket, currentUser?.id || '', currentUser?.name);

    // Enhanced initiateCall wrapper
    const initiateCall = async (receiverId: string, receiverName: string, callType: 'audio' | 'video' = 'video') => {
        console.log(`📞 Initiating ${callType} call from ${currentUser?.name} to ${receiverName}`);
        console.log('👤 Current user info:', {
            id: currentUser?.id,
            name: currentUser?.name,
            email: currentUser?.email
        });

        // Gọi với đầy đủ thông tin
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
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        isInCall,
        callStatus,
        callEndReason,
        callType: callType || 'video'
    };

    // Enhanced display names logic - FIX HERE
    const getDisplayNames = () => {
        if (isInitiator) {
            // Người gọi (A) - hiển thị:
            // - localUserName: tên của A (currentUser.name)
            // - remoteUserName: tên của B (receiverName)
            return {
                localUserName: currentUser?.name || 'Bạn',
                remoteUserName: receiverName || 'Người dùng'
            };
        } else {
            // Người nhận (B) - hiển thị:
            // - localUserName: tên của B (currentUser.name)  
            // - remoteUserName: tên của A (callerName)
            return {
                localUserName: currentUser?.name || 'Bạn',
                remoteUserName: callerName || 'Người dùng'
            };
        }
    };

    const displayNames = getDisplayNames();

    // Debug logging
    console.log('SocketContext Display Names Debug:', {
        isInitiator,
        currentUserName: currentUser?.name,
        callerName,
        receiverName,
        displayNames,
        isInCall,
        callStatus
    });

    return (
        <SocketContext.Provider value={contextValue}>
            {children}

            {/* Incoming Call Modal */}
            {incomingCall && (
                <IncomingCallModal
                    incomingCall={incomingCall}
                    onAccept={acceptCall}
                    onReject={() => rejectCall('declined')}
                />
            )}

            {/* Call Interface với tên người dùng CHÍNH XÁC */}
            {isInCall && room && localParticipant && (
                <CallInterface
                    room={room}
                    localParticipant={localParticipant}
                    remoteParticipants={remoteParticipants}
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