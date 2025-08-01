import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { PostNotification } from '@/services/postNotificationService';
import { useChannels } from '@/contexts/ChannelContext';

export function usePostNotificationListener() {
    const { socket } = useSocket();
    const { toast } = useToast();
    const { addMessageToChannel } = useChannels();

    useEffect(() => {
        if (!socket) return;

        // Listen for post notifications sent to channels
        const handlePostNotificationReceived = (data: {
            channelId: string;
            notification: PostNotification;
            timestamp: string;
        }) => {
            console.log('📢 Received post notification:', data.notification.title);
            console.log('📍 For channel:', data.channelId);

            // Create a message in the channel instead of just showing toast
            const postMessage = {
                content: `📝 **Bài đăng mới**: ${data.notification.title}`,
                sender: {
                    id: data.notification.authorId,
                    name: data.notification.authorName,
                    avatar: data.notification.authorAvatar
                },
                type: 'post_notification' as const,
                postData: {
                    postId: data.notification.postId,
                    title: data.notification.title,
                    excerpt: data.notification.excerpt,
                    authorName: data.notification.authorName,
                    authorAvatar: data.notification.authorAvatar,
                    createdAt: data.notification.createdAt
                }
            };

            // Add message to channel
            addMessageToChannel(data.channelId, postMessage);

            // Also show a brief toast for immediate feedback
            toast({
                title: "📝 Bài đăng mới",
                description: `${data.notification.authorName} đã đăng bài trong kênh`,
                duration: 3000
            });
        };

        // Listen for public post notifications
        const handlePublicPostNotificationReceived = (data: {
            notification: PostNotification;
            timestamp: string;
        }) => {
            console.log('🌍 Received public post notification:', data.notification.title);

            toast({
                title: "📝 Bài đăng công khai mới",
                description: `${data.notification.authorName} đã đăng "${data.notification.title}"`,
                duration: 5000
            });
        };

        socket.on('postNotificationReceived', handlePostNotificationReceived);
        socket.on('publicPostNotificationReceived', handlePublicPostNotificationReceived);

        return () => {
            socket.off('postNotificationReceived', handlePostNotificationReceived);
            socket.off('publicPostNotificationReceived', handlePublicPostNotificationReceived);
        };
    }, [socket, toast]);
}