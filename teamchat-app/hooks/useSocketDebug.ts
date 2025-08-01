import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export function useSocketDebug() {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) {
            console.log('🔌 SocketDebug: No socket available');
            return;
        }

        console.log('🔌 SocketDebug: Socket available, ID:', socket.id);
        console.log('🔌 SocketDebug: Socket connected:', socket.connected);

        // Listen for all socket events for debugging
        const originalEmit = socket.emit;
        socket.emit = function (...args: any[]) {
            console.log('📤 Socket EMIT:', args[0], JSON.stringify(args.slice(1), null, 2));
            return originalEmit.apply(this, args);
        };

        // Listen for connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('💥 Socket connection error:', error);
        });

        // Listen for post notification events specifically
        socket.on('postNotificationReceived', (data) => {
            console.log('📢 Socket received postNotificationReceived:', data);
        });

        socket.on('publicPostNotificationReceived', (data) => {
            console.log('🌍 Socket received publicPostNotificationReceived:', data);
        });

        return () => {
            console.log('🧹 SocketDebug: Cleaning up');
        };
    }, [socket]);
}