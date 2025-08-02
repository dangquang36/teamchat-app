"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function PostNotificationToast() {
    const { socket } = useSocket();
    const { toast } = useToast();
    const router = useRouter();

    // Track processed notifications to prevent duplicates
    const processedNotifications = useRef(new Set<string>());

    useEffect(() => {
        if (!socket) {
            console.log('🔌 PostNotificationToast: No socket available');
            return;
        }

        console.log('🔌 PostNotificationToast: Setting up listeners');

        // Listen for post notifications sent to channels
        const handlePostNotificationReceived = (data: any) => {
            console.log('📢 PostNotificationToast: Received post notification:', data);

            if (data.notification) {
                const { notification } = data;

                // Create unique key for this notification
                const notificationKey = `toast_${data.channelId}_${notification.postId}`;

                // Check if already processed
                if (processedNotifications.current.has(notificationKey)) {
                    console.log('⚠️ PostNotificationToast: Notification already processed:', notificationKey);
                    return;
                }

                // Mark as processed
                processedNotifications.current.add(notificationKey);

                toast({
                    title: "📝 Bài đăng mới trong kênh",
                    description: `${notification.authorName} đã đăng bài "${notification.title}"`,
                    duration: 10000
                });

                // Clean up after 5 minutes
                setTimeout(() => {
                    processedNotifications.current.delete(notificationKey);
                }, 5 * 60 * 1000);
            }
        };

        // Listen for own post notifications (for sender to see confirmation)
        const handleOwnPostNotification = (data: any) => {
            console.log('📢 PostNotificationToast: Received own post notification:', data);

            if (data.notification) {
                const { notification } = data;

                // Create unique key for own notification
                const notificationKey = `toast_own_${data.channelId}_${notification.postId}`;

                // Check if already processed
                if (processedNotifications.current.has(notificationKey)) {
                    console.log('⚠️ PostNotificationToast: Own notification already processed:', notificationKey);
                    return;
                }

                // Mark as processed
                processedNotifications.current.add(notificationKey);

                toast({
                    title: "✅ Bài đăng đã được chia sẻ",
                    description: `Bạn đã chia sẻ bài "${notification.title}" đến kênh`,
                    duration: 5000
                });

                // Clean up after 5 minutes
                setTimeout(() => {
                    processedNotifications.current.delete(notificationKey);
                }, 5 * 60 * 1000);
            }
        };

        // Listen for public post notifications
        const handlePublicPostNotificationReceived = (data: any) => {
            console.log('🌍 PostNotificationToast: Received public post notification:', data);

            if (data.notification) {
                const { notification } = data;

                // Create unique key for public notification
                const publicNotificationKey = `toast_public_${notification.postId}`;

                // Check if already processed
                if (processedNotifications.current.has(publicNotificationKey)) {
                    console.log('⚠️ PostNotificationToast: Public notification already processed:', publicNotificationKey);
                    return;
                }

                // Mark as processed
                processedNotifications.current.add(publicNotificationKey);

                toast({
                    title: "📝 Bài đăng công khai mới",
                    description: `${notification.authorName} đã đăng "${notification.title}"`,
                    duration: 10000
                });

                // Clean up after 5 minutes
                setTimeout(() => {
                    processedNotifications.current.delete(publicNotificationKey);
                }, 5 * 60 * 1000);
            }
        };

        socket.on('postNotificationReceived', handlePostNotificationReceived);
        socket.on('ownPostNotification', handleOwnPostNotification);
        socket.on('publicPostNotificationReceived', handlePublicPostNotificationReceived);

        return () => {
            console.log('🧹 PostNotificationToast: Cleaning up listeners');
            socket.off('postNotificationReceived', handlePostNotificationReceived);
            socket.off('ownPostNotification', handleOwnPostNotification);
            socket.off('publicPostNotificationReceived', handlePublicPostNotificationReceived);
        };
    }, [socket, toast, router]);

    return null; // This component doesn't render anything
}