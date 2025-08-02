import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { PostNotification } from '@/services/postNotificationService';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function useChannelPostNotificationListener() {
    const { socket } = useSocket();
    const { addMessageToChannel, getChannel } = useChannels();
    const currentUser = useCurrentUser();

    // Track processed notifications to prevent duplicates
    const processedNotifications = useRef(new Set<string>());

    useEffect(() => {
        if (!socket || !currentUser) return;

        // Listen for post notifications sent to channels
        const handlePostNotificationReceived = (data: {
            channelId: string;
            notification: PostNotification;
            timestamp: string;
        }) => {
            console.log('📢 Channel: Received post notification:', data.notification.title);
            console.log('📍 For channel:', data.channelId);
            console.log('👤 Current user:', currentUser.id);

            // Check if user is a member of this channel
            const channel = getChannel(data.channelId);
            if (!channel) {
                console.log('❌ Channel not found or user not a member:', data.channelId);
                return;
            }

            const isMember = channel.members.some(member => member.id === currentUser.id);
            if (!isMember) {
                console.log('❌ User is not a member of this channel:', data.channelId);
                return;
            }

            // Check if this notification was already processed
            const notificationKey = `channel_${data.channelId}_${data.notification.postId}`;
            if (processedNotifications.current.has(notificationKey)) {
                console.log('⚠️ Channel: Post notification already processed for this channel:', notificationKey);
                return;
            }

            // Mark as processed
            processedNotifications.current.add(notificationKey);

            // Create a message in the channel with clear author information
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

            // Clean up processed notifications after 5 minutes
            setTimeout(() => {
                processedNotifications.current.delete(notificationKey);
            }, 5 * 60 * 1000);
        };

        socket.on('postNotificationReceived', handlePostNotificationReceived);

        return () => {
            socket.off('postNotificationReceived', handlePostNotificationReceived);
        };
    }, [socket, addMessageToChannel, currentUser, getChannel]);
} 