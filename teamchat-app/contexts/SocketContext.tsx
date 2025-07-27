'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCall, CallStatus } from '@/hooks/useCall';
import IncomingCallModal from '@/components/modals/Call/IncomingCallModal';
import CallInterface from '@/components/chat/CallInterface';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    initiateCall: (receiverId: string, receiverName: string) => Promise<{ success: boolean; error?: string; roomName?: string }>;
    acceptCall: () => Promise<{ success: boolean; error?: string }>;
    rejectCall: (reason?: 'busy' | 'declined' | 'unavailable') => void;
    endCall: () => Promise<void>;
    isInCall: boolean;
    callStatus: CallStatus;
    callEndReason: string | null;
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

    // Chỉ sử dụng một useEffect để khởi tạo socket
    useEffect(() => {
        // Chỉ kết nối khi có thông tin người dùng
        if (currentUser?.id) {
            console.log('Initializing socket for user:', currentUser.id);

            // URL của server. Mặc định là URL hiện tại.
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
                // Gửi sự kiện 'join' để server biết user ID của client này
                newSocket.emit('join', currentUser.id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                console.log('Cleaning up socket connection');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [currentUser?.id]);

    // Sử dụng call hook với socket và user ID
    const {
        room,
        isInCall,
        incomingCall,
        callStatus,
        localParticipant,
        remoteParticipants,
        autoEndMessage,
        callEndReason,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall
    } = useCall(socket, currentUser?.id || '');

    const contextValue: SocketContextType = {
        socket,
        isConnected,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        isInCall,
        callStatus,
        callEndReason
    };

    return (
        <SocketContext.Provider value={contextValue}>
            {children}

            {/* Incoming Call Modal */}
            {incomingCall && (
                <IncomingCallModal
                    incomingCall={incomingCall}
                    onAccept={acceptCall}
                    onReject={() => rejectCall('busy')}
                />
            )}

            {/* Call Interface - với auto end message support và call end reason */}
            {isInCall && room && localParticipant && (
                <CallInterface
                    room={room}
                    localParticipant={localParticipant}
                    remoteParticipants={remoteParticipants}
                    onEndCall={endCall}
                    autoEndMessage={autoEndMessage}
                    callEndReason={callEndReason}
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