import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { PostNotification } from '@/services/postNotificationService';

export function usePostNotificationListener() {
    const { socket } = useSocket();

    // Track processed notifications to prevent duplicates
    const processedNotifications = useRef(new Set<string>());

    useEffect(() => {
        if (!socket) return;

        // Listen for public post notifications only
        const handlePublicPostNotificationReceived = (data: {
            notification: PostNotification;
            timestamp: string;
        }) => {
            console.log('🌍 Received public post notification:', data.notification.title);

            // Check if this public notification was already processed
            const publicNotificationKey = `listener_public_${data.notification.postId}`;
            if (processedNotifications.current.has(publicNotificationKey)) {
                console.log('⚠️ Public post notification already processed:', publicNotificationKey);
                return;
            }

            // Mark as processed
            processedNotifications.current.add(publicNotificationKey);

            // Clean up processed notifications after 5 minutes
            setTimeout(() => {
                processedNotifications.current.delete(publicNotificationKey);
            }, 5 * 60 * 1000);
        };

        socket.on('publicPostNotificationReceived', handlePublicPostNotificationReceived);

        return () => {
            socket.off('publicPostNotificationReceived', handlePublicPostNotificationReceived);
        };
    }, [socket]);
}