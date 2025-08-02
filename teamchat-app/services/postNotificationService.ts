import { Socket } from 'socket.io-client';
import { Post } from '@/app/types';

export interface PostNotification {
    id: string;
    type: 'NEW_POST' | 'POST_UPDATE' | 'POST_DELETED';
    postId: string;
    post?: Post;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    channelIds: string[];
    title: string;
    excerpt: string; // First 150 characters of content
    createdAt: string;
}

export interface PostNotificationServiceResponse {
    success: boolean;
    error?: string;
    data?: any;
}

export class PostNotificationService {
    // Track sent notifications to prevent duplicates
    private static sentNotifications = new Set<string>();

    /**
     * Gửi thông báo bài đăng mới đến các kênh được chọn
     */
    static sendNewPostNotification(
        socket: Socket | null,
        post: Post,
        channelIds: string[]
    ): PostNotificationServiceResponse {
        try {
            if (!socket || !socket.connected) {
                console.error('Socket is not available or not connected');
                return {
                    success: false,
                    error: 'Socket connection not available'
                };
            }

            if (channelIds.length === 0) {
                console.log('No channels selected, skipping notification');
                return {
                    success: true,
                    data: { message: 'No channels to notify' }
                };
            }

            // Create unique notification ID to prevent duplicates
            const notificationId = `post_notification_${post.id}_${Date.now()}`;

            // Check if this post notification was already sent
            if (this.sentNotifications.has(post.id)) {
                console.log('⚠️ Post notification already sent for post:', post.id);
                return {
                    success: true,
                    data: { message: 'Notification already sent for this post' }
                };
            }

            const notification: PostNotification = {
                id: notificationId,
                type: 'NEW_POST',
                postId: post.id,
                post: post,
                authorId: post.author.id,
                authorName: post.author.name,
                authorAvatar: post.author.avatar,
                channelIds: channelIds,
                title: post.title,
                excerpt: this.getPostExcerpt(post.plainTextContent || post.content),
                createdAt: new Date().toISOString()
            };

            console.log(`📢 Sending post notification to channels:`, channelIds);
            console.log(`📝 Post details:`, {
                title: post.title,
                author: post.author.name,
                visibility: post.visibility
            });

            // Mark this post as notified to prevent duplicates
            this.sentNotifications.add(post.id);

            // Emit to each channel
            channelIds.forEach(channelId => {
                socket.emit('postNotificationToChannel', {
                    channelId,
                    notification,
                    senderId: post.author.id
                });
                console.log(`✅ Post notification sent to channel: ${channelId} by ${post.author.id}`);
            });

            // Clean up sent notifications after 5 minutes to prevent memory leaks
            setTimeout(() => {
                this.sentNotifications.delete(post.id);
            }, 5 * 60 * 1000);

            return {
                success: true,
                data: { notification, channelIds }
            };

        } catch (error) {
            console.error('Error sending post notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Gửi thông báo bài đăng công khai đến tất cả người dùng
     */
    static sendPublicPostNotification(socket: Socket | null, post: Post): PostNotificationServiceResponse {
        try {
            if (!socket || !socket.connected) {
                console.error('Socket is not available or not connected');
                return {
                    success: false,
                    error: 'Socket connection not available'
                };
            }

            // Check if this public post notification was already sent
            if (this.sentNotifications.has(`public_${post.id}`)) {
                console.log('⚠️ Public post notification already sent for post:', post.id);
                return {
                    success: true,
                    data: { message: 'Public notification already sent for this post' }
                };
            }

            const notification: PostNotification = {
                id: `public_post_notification_${Date.now()}`,
                type: 'NEW_POST',
                postId: post.id,
                post: post,
                authorId: post.author.id,
                authorName: post.author.name,
                authorAvatar: post.author.avatar,
                channelIds: [], // Empty for public posts
                title: post.title,
                excerpt: this.getPostExcerpt(post.plainTextContent || post.content),
                createdAt: new Date().toISOString()
            };

            console.log(`🌍 Sending public post notification`);
            console.log(`📝 Post details:`, {
                title: post.title,
                author: post.author.name,
                visibility: post.visibility
            });

            // Mark this public post as notified
            this.sentNotifications.add(`public_${post.id}`);

            socket.emit('publicPostNotification', { notification });
            console.log(`✅ Public post notification sent`);

            // Clean up sent notifications after 5 minutes
            setTimeout(() => {
                this.sentNotifications.delete(`public_${post.id}`);
            }, 5 * 60 * 1000);

            return {
                success: true,
                data: { notification }
            };

        } catch (error) {
            console.error('Error sending public post notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Tạo excerpt từ nội dung bài đăng
     */
    private static getPostExcerpt(content: string, maxLength: number = 150): string {
        // Remove HTML tags for plain text excerpt
        const plainText = content.replace(/<[^>]*>/g, '').trim();

        if (plainText.length <= maxLength) {
            return plainText;
        }

        // Find the last complete word within the limit
        const truncated = plainText.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    /**
     * Xử lý thông báo bài đăng dựa trên visibility
     */
    static handlePostNotification(socket: Socket | null, post: Post): PostNotificationServiceResponse {
        try {
            console.log(`🔄 Processing post notification for post: ${post.title}`);
            console.log(`👁️ Visibility: ${post.visibility}`);

            switch (post.visibility) {
                case 'public':
                    return this.sendPublicPostNotification(socket, post);

                case 'channels':
                    if (!post.sharedChannels || post.sharedChannels.length === 0) {
                        console.warn('Post visibility is "channels" but no channels selected');
                        return {
                            success: false,
                            error: 'No channels selected for sharing'
                        };
                    }
                    // Only send to selected channels, not public
                    return this.sendNewPostNotification(socket, post, post.sharedChannels);

                case 'private':
                    console.log('Post is private, no notifications sent');
                    return {
                        success: true,
                        data: { message: 'Private post, no notifications sent' }
                    };

                default:
                    console.error('Unknown post visibility:', post.visibility);
                    return {
                        success: false,
                        error: 'Unknown post visibility'
                    };
            }

        } catch (error) {
            console.error('Error handling post notification:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

// Hook để sử dụng post notification service
export const usePostNotifications = () => {
    const sendPostNotification = (socket: Socket | null, post: Post) => {
        return PostNotificationService.handlePostNotification(socket, post);
    };

    return {
        sendPostNotification
    };
};