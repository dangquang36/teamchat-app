

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const currentUser = useCurrentUser();

    useEffect(() => {
        // Chỉ kết nối khi có thông tin người dùng
        if (currentUser) {
            // URL của server. Mặc định là URL hiện tại.
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

            newSocket.on('connect', () => {
                setIsConnected(true);
                // Gửi sự kiện 'join' để server biết user ID của client này
                newSocket.emit('join', currentUser.id);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [currentUser]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};