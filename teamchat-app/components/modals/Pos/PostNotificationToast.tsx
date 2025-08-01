"use client";

import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function PostNotificationToast() {
    const { socket } = useSocket();
    const { toast } = useToast();
    const router = useRouter();

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

                toast({
                    title: "📝 Bài đăng mới trong kênh",
                    description: `${notification.authorName} đã đăng "${notification.title}"`,
                    duration: 10000
                });
            }
        };

        // Listen for public post notifications
        const handlePublicPostNotificationReceived = (data: any) => {
            console.log('🌍 PostNotificationToast: Received public post notification:', data);

            if (data.notification) {
                const { notification } = data;

                toast({
                    title: "📝 Bài đăng công khai mới",
                    description: `${notification.authorName} đã đăng "${notification.title}"`,
                    duration: 10000
                });
            }
        };

        socket.on('postNotificationReceived', handlePostNotificationReceived);
        socket.on('publicPostNotificationReceived', handlePublicPostNotificationReceived);

        return () => {
            console.log('🧹 PostNotificationToast: Cleaning up listeners');
            socket.off('postNotificationReceived', handlePostNotificationReceived);
            socket.off('publicPostNotificationReceived', handlePublicPostNotificationReceived);
        };
    }, [socket, toast, router]);

    return null; // This component doesn't render anything
}