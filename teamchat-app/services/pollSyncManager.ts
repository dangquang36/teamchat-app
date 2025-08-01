import { Poll } from '../app/types';

export interface PollSyncPayload {
    channelId: string;
    messageId: string;
    updatedPoll: Poll;
    voter?: {
        id: string;
        name: string;
        avatar?: string;
    };
    action?: 'added' | 'removed';
    optionText?: string;
    timestamp: Date;
}

export interface PollSyncHandlers {
    onPollUpdated: (payload: PollSyncPayload) => void;
    onPollVoteNotification: (payload: any) => void;
}

export class PollSyncManager {
    private socket: any;
    private handlers: PollSyncHandlers;
    private currentUserId: string | null = null;

    constructor(socket: any, handlers: PollSyncHandlers) {
        this.socket = socket;
        this.handlers = handlers;
        this.setupSocketListeners();
    }

    /**
     * Set current user ID to filter out own updates
     */
    setCurrentUserId(userId: string) {
        this.currentUserId = userId;
        console.log(`👤 [PollSyncManager] Set current user ID: ${userId}`);
    }

    /**
     * Setup socket event listeners
     */
    private setupSocketListeners() {
        if (!this.socket) {
            console.error('❌ [PollSyncManager] No socket provided');
            return;
        }

        // Listen for poll vote notifications
        this.socket.on('pollVoted', (payload: any) => {
            console.log(`🔔 [PollSyncManager] Received poll vote notification:`, payload);

            // Skip if this is our own vote
            if (this.currentUserId && payload.voter?.id === this.currentUserId) {
                console.log(`⚠️ [PollSyncManager] Skipping own vote notification`);
                return;
            }

            this.handlers.onPollVoteNotification(payload);
        });

        // Listen for poll data updates
        this.socket.on('pollUpdated', (payload: PollSyncPayload) => {
            console.log(`📊 [PollSyncManager] Received poll update:`, {
                channelId: payload.channelId,
                pollId: payload.updatedPoll.id,
                totalVoters: payload.updatedPoll.totalVoters,
                timestamp: payload.timestamp
            });

            // Skip if this is from our own action (though server should handle this)
            if (this.currentUserId && payload.voter?.id === this.currentUserId) {
                console.log(`⚠️ [PollSyncManager] Skipping own poll update`);
                return;
            }

            // Validate payload
            if (!this.validatePollSyncPayload(payload)) {
                console.error('❌ [PollSyncManager] Invalid poll sync payload');
                return;
            }

            this.handlers.onPollUpdated(payload);
        });

        console.log(`✅ [PollSyncManager] Socket listeners setup complete`);
    }

    /**
     * Send poll update to server
     */
    sendPollUpdate(payload: Omit<PollSyncPayload, 'timestamp'>): boolean {
        if (!this.socket || !this.socket.connected) {
            console.error('❌ [PollSyncManager] Socket not connected');
            return false;
        }

        const fullPayload: PollSyncPayload = {
            ...payload,
            timestamp: new Date()
        };

        console.log(`📤 [PollSyncManager] Sending poll update:`, {
            channelId: payload.channelId,
            pollId: payload.updatedPoll.id,
            action: payload.action,
            voter: payload.voter?.name
        });

        try {
            // Send poll vote notification first
            if (payload.voter && payload.action && payload.optionText) {
                const voteNotificationPayload = {
                    channelId: payload.channelId,
                    pollId: payload.updatedPoll.id,
                    voter: payload.voter,
                    optionText: payload.optionText,
                    pollQuestion: payload.updatedPoll.question,
                    action: payload.action,
                    timestamp: fullPayload.timestamp
                };

                console.log(`📤 [PollSyncManager] Sending vote notification:`, voteNotificationPayload);
                this.socket.emit('pollVoted', voteNotificationPayload);
            }

            // Send poll data update
            this.socket.emit('pollUpdated', fullPayload);

            console.log(`✅ [PollSyncManager] Poll update sent successfully`);
            return true;
        } catch (error) {
            console.error(`❌ [PollSyncManager] Failed to send poll update:`, error);
            return false;
        }
    }

    /**
     * Validate poll sync payload
     */
    private validatePollSyncPayload(payload: PollSyncPayload): boolean {
        if (!payload.channelId) {
            console.error('❌ [PollSyncManager] Missing channelId in payload');
            return false;
        }

        if (!payload.messageId) {
            console.error('❌ [PollSyncManager] Missing messageId in payload');
            return false;
        }

        if (!payload.updatedPoll || !payload.updatedPoll.id) {
            console.error('❌ [PollSyncManager] Missing or invalid poll data in payload');
            return false;
        }

        return true;
    }

    /**
     * Cleanup socket listeners
     */
    cleanup() {
        if (this.socket) {
            this.socket.off('pollVoted');
            this.socket.off('pollUpdated');
            console.log(`🧹 [PollSyncManager] Cleanup complete`);
        }
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.socket && this.socket.connected;
    }

    /**
     * Get socket info for debugging
     */
    getSocketInfo(): { connected: boolean; id?: string } {
        return {
            connected: this.socket?.connected || false,
            id: this.socket?.id
        };
    }
}