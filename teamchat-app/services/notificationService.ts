import { ChannelInvitation } from '@/contexts/ChannelContext';

export interface NotificationServiceResponse {
    success: boolean;
    error?: string;
    data?: any;
}

export class NotificationService {
    /**
     * Gửi notification qua Socket.io
     */
    static sendSocketNotification(socket: any, event: string, data: any): NotificationServiceResponse {
        try {
            if (!socket) {
                console.error('Socket is not available');
                return {
                    success: false,
                    error: 'Socket connection not available'
                };
            }

            console.log(`Sending ${event} notification:`, data);
            console.log('Socket ID:', socket.id);
            console.log('Socket connected:', socket.connected);

            socket.emit(event, data);

            console.log(`${event} notification sent successfully`);

            return {
                success: true
            };
        } catch (error) {
            console.error(`Error sending ${event} notification:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Gửi channel invitation notification
     */
    static sendChannelInvitationNotification(socket: any, recipientId: string, invitation: ChannelInvitation): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'sendChannelInvitation', {
            recipientId,
            payload: invitation
        });
    }

    /**
     * Gửi invitation accepted notification
     */
    static sendInvitationAcceptedNotification(socket: any, inviterId: string, invitation: ChannelInvitation): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'acceptChannelInvitation', {
            inviterId,
            payload: invitation
        });
    }

    /**
     * Gửi invitation declined notification
     */
    static sendInvitationDeclinedNotification(socket: any, inviterId: string, invitation: ChannelInvitation): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'declineChannelInvitation', {
            inviterId,
            payload: invitation
        });
    }

    /**
     * Gửi meeting notification
     */
    static sendMeetingNotification(socket: any, channelId: string, meetingData: any): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'notifyChannelMeeting', {
            channelId,
            meetingData
        });
    }

    /**
     * Gửi channel message notification
     */
    static sendChannelMessageNotification(socket: any, channelId: string, message: any, senderId: string): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'sendChannelMessage', {
            channelId,
            message,
            senderId
        });
    }

    /**
     * Test socket connection
     */
    static testSocketConnection(socket: any, userId: string): NotificationServiceResponse {
        return this.sendSocketNotification(socket, 'testConnection', { userId });
    }

    /**
     * Đăng ký user với socket
     */
    static registerUserWithSocket(socket: any, userId: string, userInfo: any): NotificationServiceResponse {
        try {
            if (!socket) {
                console.error('Socket is not available for user registration');
                return {
                    success: false,
                    error: 'Socket connection not available'
                };
            }

            console.log('Registering user with socket:', {
                userId,
                userInfo,
                socketId: socket.id,
                isConnected: socket.connected
            });

            // Emit userOnline event
            socket.emit('userOnline', {
                userId,
                userInfo
            });

            // Emit join event for call functionality
            socket.emit('join', userId);

            console.log('User registered with socket successfully');

            return {
                success: true
            };
        } catch (error) {
            console.error('Error registering user with socket:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Gửi poll vote notification
     */
    static sendPollVoteNotification(
        socket: any,
        channelId: string,
        pollId: string,
        optionId: string,
        voter: { id: string; name: string; avatar?: string },
        pollQuestion: string,
        optionText: string
    ): NotificationServiceResponse {
        console.log('📊 Sending poll vote notification for channel:', channelId);
        console.log('🗳️ Vote data:', { pollId, optionId, voter, pollQuestion, optionText });

        return this.sendSocketNotification(socket, 'pollVoted', {
            channelId,
            pollId,
            optionId,
            voter,
            pollQuestion,
            optionText,
            timestamp: new Date()
        });
    }

    /**
     * Gửi poll update (real-time sync poll data)
     */
    static sendPollUpdate(
        socket: any,
        channelId: string,
        messageId: string,
        updatedPoll: any
    ): NotificationServiceResponse {
        console.log('📊 [NotificationService] Sending poll update for channel:', channelId);
        console.log('🔄 Poll ID being sent:', updatedPoll.id);
        console.log('🔄 Poll question:', updatedPoll.question);
        console.log('🔄 Total voters:', updatedPoll.totalVoters);
        console.log('📡 Socket connected:', socket?.connected);
        console.log('📡 Socket ID:', socket?.id);

        const payload = {
            channelId,
            messageId,
            updatedPoll,
            timestamp: new Date()
        };

        console.log('📤 Full payload being sent:', payload);

        const result = this.sendSocketNotification(socket, 'pollUpdated', payload);

        if (result.success) {
            console.log('✅ Poll update sent successfully for poll:', updatedPoll.id);
        } else {
            console.error('❌ Failed to send poll update:', result.error);
        }

        return result;
    }
} 