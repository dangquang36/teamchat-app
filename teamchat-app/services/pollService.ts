import { Poll, PollOption, PollVote } from '../app/types';

export interface PollVoteResult {
    success: boolean;
    action: 'added' | 'removed';
    updatedPoll: Poll;
    messageId: string;
    error?: string;
}

export interface PollUpdatePayload {
    channelId: string;
    messageId: string;
    updatedPoll: Poll;
    voter: {
        id: string;
        name: string;
        avatar?: string;
    };
    action: 'added' | 'removed';
    optionText: string;
}

export class PollService {
    /**
     * Generate unique poll ID
     */
    static generatePollId(userId: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `poll_${userId}_${timestamp}_${random}`;
    }

    /**
     * Create a new poll
     */
    static createPoll(
        pollData: Omit<Poll, "id" | "createdAt" | "totalVoters">,
        currentUser: { id: string; name: string; avatar?: string }
    ): Poll {
        const poll: Poll = {
            ...pollData,
            id: this.generatePollId(currentUser.id),
            createdAt: new Date(),
            totalVoters: 0,
            createdBy: currentUser.id,
            createdByName: currentUser.name,
        };

        console.log(`📊 [PollService] Created new poll:`, {
            pollId: poll.id,
            question: poll.question,
            options: poll.options.map(opt => ({ id: opt.id, text: opt.text })),
            creator: poll.createdByName
        });

        return poll;
    }

    /**
     * Process vote on a poll
     */
    static processVote(
        poll: Poll,
        optionId: string,
        voter: { id: string; name: string; avatar?: string }
    ): { updatedPoll: Poll; action: 'added' | 'removed'; optionText: string } {
        const updatedPoll = { ...poll };

        // Find the option to vote on
        const optionIndex = updatedPoll.options.findIndex(opt => opt.id === optionId);
        if (optionIndex === -1) {
            throw new Error(`Option ${optionId} not found in poll ${poll.id}`);
        }

        const option = updatedPoll.options[optionIndex];
        const optionText = option.text;

        // Check if user already voted
        const existingVoteIndex = option.votes.findIndex(vote => vote.userId === voter.id);
        let action: 'added' | 'removed';

        if (existingVoteIndex >= 0) {
            // Remove existing vote
            updatedPoll.options[optionIndex].votes.splice(existingVoteIndex, 1);
            action = 'removed';
            console.log(`🗳️ [PollService] ${voter.name} removed vote for "${optionText}"`);
        } else {
            // Add new vote
            const newVote: PollVote = {
                userId: voter.id,
                userName: voter.name,
                userAvatar: voter.avatar || '',
                votedAt: new Date()
            };
            updatedPoll.options[optionIndex].votes.push(newVote);
            action = 'added';
            console.log(`🗳️ [PollService] ${voter.name} voted for "${optionText}"`);
        }

        // Update total voters count
        const allVoters = new Set<string>();
        updatedPoll.options.forEach(opt => {
            opt.votes.forEach(vote => allVoters.add(vote.userId));
        });
        updatedPoll.totalVoters = allVoters.size;

        console.log(`📊 [PollService] Updated poll stats:`, {
            pollId: poll.id,
            totalVoters: updatedPoll.totalVoters,
            optionVotes: updatedPoll.options.map(opt => ({
                text: opt.text,
                votes: opt.votes.length
            }))
        });

        return { updatedPoll, action, optionText };
    }

    /**
     * Send poll update to other clients via PollSyncManager
     * Note: This method is kept for compatibility but now delegates to PollSyncManager
     */
    static async sendPollUpdate(
        socket: any,
        channelId: string,
        messageId: string,
        updatedPoll: Poll,
        voter: { id: string; name: string; avatar?: string },
        action: 'added' | 'removed',
        optionText: string
    ): Promise<boolean> {
        if (!socket || !socket.connected) {
            console.error('❌ [PollService] Socket not connected');
            return false;
        }

        console.log(`📤 [PollService] Preparing poll update for PollSyncManager:`, {
            channelId,
            messageId,
            pollId: updatedPoll.id,
            voter: voter.name,
            action,
            optionText,
            totalVoters: updatedPoll.totalVoters
        });

        try {
            // Create payload for PollSyncManager
            const payload = {
                channelId,
                messageId,
                updatedPoll,
                voter,
                action,
                optionText
            };

            // Send via socket directly (PollSyncManager will be handling this on the receiving end)
            socket.emit('pollUpdated', {
                ...payload,
                timestamp: new Date()
            });

            // Also send vote notification
            socket.emit('pollVoted', {
                channelId,
                pollId: updatedPoll.id,
                voter,
                optionText,
                pollQuestion: updatedPoll.question,
                action,
                timestamp: new Date()
            });

            console.log(`✅ [PollService] Poll update sent successfully via socket`);
            return true;
        } catch (error) {
            console.error(`❌ [PollService] Failed to send poll update:`, error);
            return false;
        }
    }

    /**
     * Find poll message in channel messages
     */
    static findPollMessage(messages: any[], pollId: string): { message: any; index: number } | null {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (message.poll && message.poll.id === pollId) {
                return { message, index: i };
            }
        }
        return null;
    }

    /**
     * Update poll in messages array
     */
    static updatePollInMessages(messages: any[], pollId: string, updatedPoll: Poll): any[] {
        return messages.map(message => {
            if (message.poll && message.poll.id === pollId) {
                console.log(`📝 [PollService] Updating poll in message ${message.id}`);
                return { ...message, poll: updatedPoll };
            }
            return message;
        });
    }

    /**
     * Validate poll data
     */
    static validatePoll(poll: Poll): boolean {
        if (!poll.id || !poll.question || !poll.options || poll.options.length === 0) {
            console.error('❌ [PollService] Invalid poll data:', poll);
            return false;
        }
        return true;
    }

    /**
     * Validate poll option
     */
    static validatePollOption(poll: Poll, optionId: string): boolean {
        const option = poll.options.find(opt => opt.id === optionId);
        if (!option) {
            console.error(`❌ [PollService] Option ${optionId} not found in poll ${poll.id}`);
            return false;
        }
        return true;
    }

    /**
     * Get poll statistics
     */
    static getPollStats(poll: Poll): {
        totalVotes: number;
        totalVoters: number;
        options: { id: string; text: string; votes: number; percentage: number }[];
    } {
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        const allVoters = new Set<string>();
        poll.options.forEach(opt => {
            opt.votes.forEach(vote => allVoters.add(vote.userId));
        });

        return {
            totalVotes,
            totalVoters: allVoters.size,
            options: poll.options.map(opt => ({
                id: opt.id,
                text: opt.text,
                votes: opt.votes.length,
                percentage: totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0
            }))
        };
    }
}