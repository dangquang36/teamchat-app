"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import { InvitationService } from '@/services/invitationService';
import { NotificationService } from '@/services/notificationService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { PollSyncManager, PollSyncPayload } from '@/services/pollSyncManager';
import { PollService } from '@/services/pollService';
import { PollStateManager } from '@/services/pollStateManager';

export interface Channel {
    id: string;
    name: string;
    description: string;
    image?: string;
    createdAt: Date;
    members: ChannelMember[];
    messages: ChannelMessage[];
    invitations: ChannelInvitation[];
}

export interface ChannelMember {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
    joinedAt: Date;
}

export interface ChannelMessage {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'meeting' | 'poll' | 'post_notification';
    meetingData?: {
        title: string;
        roomName: string;
        createdBy: string;
        createdById: string;
        channelId: string;
        channelName: string;
        joinUrl?: string;
    };
    fileData?: {
        name: string;
        size: number;
        type: string;
        content: string; // base64 content
    };
    poll?: {
        id: string;
        question: string;
        description?: string;
        options: Array<{
            id: string;
            text: string;
            votes: Array<{
                userId: string;
                userName: string;
                userAvatar: string;
                votedAt: Date;
            }>;
        }>;
        allowMultiple: boolean;
        isAnonymous: boolean;
        showResults: "always" | "after_vote" | "after_end";
        createdBy: string;
        createdByName: string;
        createdAt: Date;
        endTime?: Date;
        isActive: boolean;
        totalVoters: number;
    };
    postData?: {
        postId: string;
        title: string;
        excerpt: string;
        authorName: string;
        authorAvatar?: string;
        createdAt: string;
    };
}

export interface ChannelInvitation {
    id: string;
    channelId: string;
    channelName: string;
    channelImage?: string; // Add channel image to interface
    inviterId: string;
    inviterName: string;
    inviterAvatar?: string;
    inviteeId: string;
    inviteeName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
}

interface ChannelContextType {
    channels: Channel[];
    addChannel: (
        channelData: Omit<Channel, 'id' | 'createdAt' | 'members' | 'messages' | 'invitations'>,
        creatorUser?: { id: string; name: string; avatar?: string }
    ) => string;
    getChannel: (id: string) => Channel | undefined;
    updateChannel: (id: string, updates: Partial<Channel>) => void;
    deleteChannel: (id: string) => void;
    addMessageToChannel: (channelId: string, message: Omit<ChannelMessage, 'id' | 'timestamp'>) => void;

    // Member management functions
    inviteMemberToChannel: (channelId: string, inviteeId: string, inviteeName: string, inviterId: string, inviterName: string, inviterAvatar?: string) => Promise<{ success: boolean; error?: string }>;
    acceptChannelInvitation: (invitationId: string, channelId: string, userId: string, userName: string, userAvatar?: string) => Promise<{ success: boolean; error?: string }>;
    declineChannelInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
    removeMemberFromChannel: (channelId: string, memberId: string) => void;
    getChannelInvitations: (userId: string) => Promise<ChannelInvitation[]>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: ReactNode }) {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [pollSyncManager, setPollSyncManager] = useState<PollSyncManager | null>(null);
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();
    const { toast } = useToast();

    // Load channels from localStorage on mount
    useEffect(() => {
        const savedChannels = localStorage.getItem('channels');
        if (savedChannels) {
            try {
                const parsedChannels = JSON.parse(savedChannels);
                // Convert string dates back to Date objects and clean up hard-coded avatars
                const channelsWithDates = parsedChannels.map((channel: any) => ({
                    ...channel,
                    createdAt: new Date(channel.createdAt),
                    members: channel.members.map((member: any) => ({
                        ...member,
                        // Clean up hard-coded avatar
                        avatar: (member.avatar === '/placeholder-user.jpg' ||
                            member.avatar === '/placeholder.jpg' ||
                            member.avatar === '/default-avatar.jpg')
                            ? undefined
                            : member.avatar,
                        joinedAt: new Date(member.joinedAt || channel.createdAt)
                    })),
                    messages: channel.messages.map((msg: any) => ({
                        ...msg,
                        // Clean up hard-coded avatar in messages
                        sender: {
                            ...msg.sender,
                            avatar: (msg.sender.avatar === '/placeholder-user.jpg' ||
                                msg.sender.avatar === '/placeholder.jpg' ||
                                msg.sender.avatar === '/default-avatar.jpg')
                                ? undefined
                                : msg.sender.avatar
                        },
                        timestamp: new Date(msg.timestamp),
                        // Preserve fileData
                        fileData: msg.fileData ? {
                            ...msg.fileData
                        } : undefined
                    })),
                    invitations: (channel.invitations || []).map((inv: any) => ({
                        ...inv,
                        // Clean up hard-coded avatar in invitations
                        inviterAvatar: (inv.inviterAvatar === '/placeholder-user.jpg' ||
                            inv.inviterAvatar === '/placeholder.jpg' ||
                            inv.inviterAvatar === '/default-avatar.jpg')
                            ? undefined
                            : inv.inviterAvatar,
                        createdAt: new Date(inv.createdAt)
                    }))
                }));
                console.log('🧹 Cleaned up channels data from localStorage');
                setChannels(channelsWithDates);
            } catch (error) {
                console.error('Failed to parse channels from localStorage:', error);
            }
        }
    }, []);

    // Save channels to localStorage whenever channels change
    useEffect(() => {
        localStorage.setItem('channels', JSON.stringify(channels));
    }, [channels]);

    // Initialize PollSyncManager when socket and currentUser are available
    useEffect(() => {
        if (!socket || !currentUser) {
            if (pollSyncManager) {
                pollSyncManager.cleanup();
                setPollSyncManager(null);
            }
            return;
        }

        console.log(`🔄 [ChannelContext] Initializing PollSyncManager for user ${currentUser.name}`);

        const syncManager = new PollSyncManager(socket, {
            onPollUpdated: (payload: PollSyncPayload) => {
                console.log(`📊 [ChannelContext] Handling poll update via PollSyncManager:`, payload);
                handlePollUpdatedViaSyncManager(payload);
            },
            onPollVoteNotification: (payload: any) => {
                console.log(`🔔 [ChannelContext] Handling poll vote notification:`, payload);
                toast({
                    title: "🗳️ Cuộc bình chọn",
                    description: `${payload.voter.name} đã bình chọn "${payload.optionText}" trong "${payload.pollQuestion}"`,
                });
            }
        });

        syncManager.setCurrentUserId(currentUser.id);
        setPollSyncManager(syncManager);

        return () => {
            syncManager.cleanup();
        };
    }, [socket, currentUser]);

    // Socket.io listeners for channel invitations - DISABLED to avoid duplicate processing
    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleChannelInvitationReceived = (invitation: ChannelInvitation) => {
            console.log('📨 ChannelContext received invitation - SKIPPING to avoid duplicates:', invitation);
            // DISABLED: Let useRealTimeUpdates handle invitation processing to avoid duplicates
            // setChannels(prev => prev.map(channel =>
            //     channel.id === invitation.channelId
            //         ? { ...channel, invitations: [...channel.invitations, invitation] }
            //         : channel
            // ));
        };

        const handleChannelInvitationAccepted = (payload: any) => {
            console.log('✅ Channel invitation accepted:', payload);
            console.log('📋 Member data being added:', {
                id: payload.inviteeId,
                name: payload.inviteeName,
                avatar: payload.inviteeAvatar,
                status: 'online'
            });

            // Update invitation status AND add member to channel for all users
            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? {
                        ...channel,
                        // Update channel image if provided
                        image: payload.channelImage || channel.image,
                        members: channel.members.some(m => m.id === payload.inviteeId)
                            ? channel.members // Member already exists
                            : [...channel.members, { // Add new member
                                id: payload.inviteeId,
                                name: payload.inviteeName,
                                avatar: payload.inviteeAvatar,
                                status: 'online',
                                joinedAt: new Date()
                            }],
                        invitations: channel.invitations.map(inv =>
                            inv.id === payload.invitationId
                                ? { ...inv, status: 'accepted' as const }
                                : inv
                        )
                    }
                    : channel
            ));

            console.log(`🎉 ${payload.inviteeName} has joined the channel!`);
        };

        const handleChannelInvitationDeclined = (payload: any) => {
            console.log('❌ Channel invitation declined:', payload);
            // Update invitation status
            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? {
                        ...channel,
                        invitations: channel.invitations.map(inv =>
                            inv.id === payload.invitationId
                                ? { ...inv, status: 'declined' as const }
                                : inv
                        )
                    }
                    : channel
            ));
        };

        socket.on('channelInvitationReceived', handleChannelInvitationReceived);
        socket.on('channelInvitationAccepted', handleChannelInvitationAccepted);
        socket.on('channelInvitationDeclined', handleChannelInvitationDeclined);

        // Handle channel messages (from OTHER users only, not from self)
        const handleChannelMessageReceived = ({ channelId, message }: { channelId: string; message: ChannelMessage }) => {
            console.log('📨 Received message from another user:', message);
            console.log('📎 Message type:', message.type);
            console.log('📁 File data:', message.fileData);
            if (message.poll) {
                console.log('📊 Poll data received:', {
                    pollId: message.poll.id,
                    question: message.poll.question,
                    optionsCount: message.poll.options.length,
                    totalVoters: message.poll.totalVoters,
                    creator: message.poll.createdByName,
                    options: message.poll.options.map(opt => ({
                        id: opt.id,
                        text: opt.text,
                        votesCount: opt.votes.length
                    }))
                });
                console.log('🔍 Poll options detail:', message.poll.options.map(opt => ({
                    id: opt.id,
                    text: opt.text,
                    votes: opt.votes.map(vote => vote.userName)
                })));
            }

            // Skip if this is my own message (to prevent duplicates)
            if (currentUser && message.sender.id === currentUser.id) {
                console.log('⚠️ Skipping own message to prevent duplicate:', message.id);
                return;
            }

            // Ensure the message has proper structure (including fileData and poll)
            const processedMessage = {
                ...message,
                timestamp: new Date(message.timestamp),
                // Preserve fileData completely
                fileData: message.fileData ? {
                    ...message.fileData
                } : undefined,
                // Preserve poll data completely and convert dates
                poll: message.poll ? {
                    ...message.poll,
                    createdAt: new Date(message.poll.createdAt),
                    endTime: message.poll.endTime ? new Date(message.poll.endTime) : undefined,
                    options: message.poll.options.map((option: any) => ({
                        ...option,
                        votes: option.votes.map((vote: any) => ({
                            ...vote,
                            votedAt: new Date(vote.votedAt)
                        }))
                    }))
                } : undefined
            };

            console.log('🔄 Processed message:', processedMessage);

            // Check if message already exists to prevent duplicates
            setChannels(prev => prev.map(channel => {
                if (channel.id === channelId) {
                    const messageExists = channel.messages.some(msg => msg.id === message.id);
                    if (messageExists) {
                        console.log('⚠️ Message already exists, skipping:', message.id);
                        return channel;
                    }

                    // Additional check for poll messages to prevent duplicate polls with same question/creator
                    if (processedMessage.poll) {
                        const duplicatePoll = channel.messages.find(msg =>
                            msg.poll &&
                            msg.poll.question === processedMessage.poll?.question &&
                            msg.poll.createdBy === processedMessage.poll?.createdBy &&
                            msg.poll.id !== processedMessage.poll?.id
                        );

                        if (duplicatePoll) {
                            console.log('⚠️ Duplicate poll detected, keeping the original one:', {
                                originalPollId: duplicatePoll.poll?.id,
                                newPollId: processedMessage.poll.id,
                                question: processedMessage.poll.question
                            });
                            return channel;
                        }
                    }

                    console.log('✅ Adding new message to channel:', processedMessage);
                    return { ...channel, messages: [...channel.messages, processedMessage] };
                }
                return channel;
            }));
        };

        // Handle member joined broadcast
        const handleChannelMemberJoined = (payload: any) => {
            console.log('👥 Channel member joined broadcast:', payload);
            console.log('👤 New member data:', payload.newMember);
            console.log('📋 Channel data:', payload.channelData);

            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? {
                        ...channel,
                        // Update channel image if provided
                        image: payload.channelData?.image || channel.image,
                        members: channel.members.some(m => m.id === payload.newMember.id)
                            ? channel.members // Member already exists
                            : [...channel.members, payload.newMember] // Add new member
                    }
                    : channel
            ));

            console.log(`🎉 ${payload.newMember.name} joined channel ${payload.channelId}!`);
        };

        // Handle meeting notification received
        const handleMeetingNotificationReceived = (payload: any) => {
            console.log('📹 Meeting notification received:', payload);

            const meetingMessage: ChannelMessage = {
                id: `meeting_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                content: `${payload.createdBy} đã tạo cuộc họp "${payload.title}"`,
                sender: {
                    id: payload.createdById,
                    name: payload.createdBy,
                    avatar: payload.creatorAvatar && payload.creatorAvatar.trim() !== ''
                        ? payload.creatorAvatar
                        : undefined
                },
                timestamp: new Date(payload.createdAt),
                type: 'meeting',
                meetingData: {
                    title: payload.title,
                    roomName: payload.roomName,
                    createdBy: payload.createdBy,
                    createdById: payload.createdById,
                    channelId: payload.channelId,
                    channelName: payload.channelName,
                    joinUrl: `/dashboard/meeting/${payload.roomName}?title=${encodeURIComponent(payload.title)}`
                }
            };

            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? { ...channel, messages: [...channel.messages, meetingMessage] }
                    : channel
            ));

            console.log(`📹 Meeting notification added to channel ${payload.channelId}`);
        };

        // Handle channel info updates
        const handleChannelInfoUpdated = (payload: any) => {
            // Skip if this is our own update (to prevent duplicates)
            if (currentUser && payload.updatedBy.id === currentUser.id) {
                return;
            }

            console.log(`🔄 Received channel update from ${payload.updatedBy.name} for channel ${payload.channelId}`);

            // Update channel data
            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? { ...channel, ...payload.updates }
                    : channel
            ));

            // Create notification message based on what was updated
            const updateMessages = [];
            if (payload.updates.name) updateMessages.push('tên kênh');
            if (payload.updates.image) updateMessages.push('ảnh đại diện');
            if (payload.updates.description) updateMessages.push('mô tả');

            const updateText = updateMessages.join(', ');

            // Show unified shadcn/ui toast notification
            toast({
                title: "🔄 Cập nhật kênh",
                description: `${payload.updatedBy.name} đã thay đổi ${updateText}`,
            });

            console.log(`🔔 Showed notification: ${payload.updatedBy.name} changed ${updateText}`);
        };

        // Handle poll vote notifications
        const handlePollVoted = (payload: any) => {
            // Skip if this is our own vote (to prevent duplicates)
            if (currentUser && payload.voter.id === currentUser.id) {
                return;
            }

            console.log(`📊 Received poll vote from ${payload.voter.name}:`, payload);

            // Show unified shadcn/ui toast notification
            toast({
                title: "🗳️ Cuộc bình chọn",
                description: `${payload.voter.name} đã bình chọn "${payload.optionText}" trong "${payload.pollQuestion}"`,
            });

            console.log(`🔔 Showed poll vote notification: ${payload.voter.name} voted for ${payload.optionText}`);
        };

        // Handle poll updates (real-time sync)
        const handlePollUpdated = (payload: any) => {
            console.log(`🚨 [DEBUG] POLL UPDATE RECEIVED! 🚨`);
            console.log(`📊 [ChannelContext] Received poll update for channel ${payload.channelId}:`, payload);
            console.log(`🗳️ Updated poll data:`, {
                pollId: payload.updatedPoll.id,
                question: payload.updatedPoll.question,
                totalVoters: payload.updatedPoll.totalVoters,
                options: payload.updatedPoll.options.map((opt: any) => ({
                    id: opt.id,
                    text: opt.text,
                    votesCount: opt.votes.length
                }))
            });
            console.log(`👤 Current user:`, currentUser?.name);
            console.log(`🆔 Payload channel ID:`, payload.channelId);
            console.log(`🆔 Current channels:`, channels.map(ch => ({ id: ch.id, name: ch.name })));

            // Update the poll data in the message
            setChannels(prev => {
                console.log(`🔍 Searching in ${prev.length} channels for channel ${payload.channelId}`);
                console.log(`🔍 Available channels:`, prev.map(ch => ch.id));

                const newChannels = prev.map(channel => {
                    console.log(`🔎 Checking channel: ${channel.id} === ${payload.channelId}? ${channel.id === payload.channelId}`);
                    if (channel.id === payload.channelId) {
                        console.log(`🎯 ✅ FOUND TARGET CHANNEL ${payload.channelId}, messages count: ${channel.messages.length}`);

                        // Log all poll messages in this channel
                        const pollMessages = channel.messages.filter(msg => msg.poll);
                        console.log(`📋 Poll messages in channel:`, pollMessages.map(msg => ({
                            messageId: msg.id,
                            pollId: msg.poll?.id,
                            question: msg.poll?.question,
                            sender: msg.sender.name
                        })));

                        let pollUpdated = false;
                        console.log(`🔍 Looking for poll ID: "${payload.updatedPoll.id}"`);

                        const updatedMessages = channel.messages.map(message => {
                            if (message.poll) {
                                console.log(`🔎 Checking message ${message.id}: poll ID "${message.poll.id}"`);
                                console.log(`🔎 Poll ID match: ${message.poll.id === payload.updatedPoll.id}`);
                            }

                            if (message.poll && message.poll.id === payload.updatedPoll.id) {
                                console.log(`✅ Found poll message to update: ${message.id}`);
                                console.log(`📊 Message sender: ${message.sender.name}`);
                                console.log(`📊 Old poll state:`, {
                                    totalVoters: message.poll.totalVoters,
                                    options: message.poll.options.map(opt => ({
                                        text: opt.text,
                                        votes: opt.votes.length
                                    }))
                                });

                                pollUpdated = true;
                                const updatedMessage = {
                                    ...message,
                                    poll: {
                                        ...payload.updatedPoll,
                                        createdAt: new Date(payload.updatedPoll.createdAt),
                                        endTime: payload.updatedPoll.endTime ? new Date(payload.updatedPoll.endTime) : undefined,
                                        options: payload.updatedPoll.options.map((option: any) => ({
                                            ...option,
                                            votes: option.votes.map((vote: any) => ({
                                                ...vote,
                                                votedAt: new Date(vote.votedAt)
                                            }))
                                        }))
                                    }
                                };

                                console.log(`🔄 New poll state:`, {
                                    totalVoters: updatedMessage.poll.totalVoters,
                                    options: updatedMessage.poll.options.map((opt: any) => ({
                                        text: opt.text,
                                        votes: opt.votes.length,
                                        voters: opt.votes.map((v: any) => v.userName)
                                    }))
                                });

                                return updatedMessage;
                            }
                            return message;
                        });

                        if (pollUpdated) {
                            console.log(`🎉 ✅ POLL UPDATED SUCCESSFULLY in channel ${payload.channelId}`);
                            console.log(`🔄 State should trigger re-render now!`);
                        } else {
                            console.error(`🚨 ❌ POLL NOT FOUND! Poll ${payload.updatedPoll.id} not found in channel ${payload.channelId}`);
                            console.error(`❌ Available poll IDs:`, pollMessages.map(msg => msg.poll?.id));
                            console.error(`❌ Searching for poll ID: "${payload.updatedPoll.id}"`);
                            console.error(`❌ Poll ID type:`, typeof payload.updatedPoll.id);
                            pollMessages.forEach(msg => {
                                if (msg.poll) {
                                    console.error(`❌ Available poll: ID="${msg.poll.id}" (type: ${typeof msg.poll.id}) question="${msg.poll.question}"`);
                                }
                            });
                        }

                        return { ...channel, messages: updatedMessages };
                    }
                    return channel;
                });

                console.log(`📋 🚀 CHANNELS STATE UPDATED, TRIGGERING RE-RENDER!`);
                console.log(`📋 New channels state:`, newChannels.map(ch => ({
                    id: ch.id,
                    messagesCount: ch.messages.length,
                    pollMessages: ch.messages.filter(msg => msg.poll).length
                })));
                return newChannels;
            });

            console.log(`🔄 ✅ POLL DATA UPDATE PROCESS COMPLETED for channel ${payload.channelId}`);
        };

        socket.on('channelMessageReceived', handleChannelMessageReceived);
        socket.on('channelMemberJoined', handleChannelMemberJoined);
        socket.on('meetingNotificationReceived', handleMeetingNotificationReceived);
        socket.on('channelInfoUpdated', handleChannelInfoUpdated);
        // Poll events now handled by PollSyncManager
        // socket.on('pollVoted', handlePollVoted);
        // socket.on('pollUpdated', handlePollUpdated);

        return () => {
            socket.off('channelInvitationReceived', handleChannelInvitationReceived);
            socket.off('channelInvitationAccepted', handleChannelInvitationAccepted);
            socket.off('channelInvitationDeclined', handleChannelInvitationDeclined);
            socket.off('channelMessageReceived', handleChannelMessageReceived);
            socket.off('channelMemberJoined', handleChannelMemberJoined);
            socket.off('meetingNotificationReceived', handleMeetingNotificationReceived);
            socket.off('channelInfoUpdated', handleChannelInfoUpdated);
            // Poll events cleanup handled by PollSyncManager
            // socket.off('pollVoted', handlePollVoted);
            // socket.off('pollUpdated', handlePollUpdated);
        };
    }, [socket, currentUser]);

    // Handle poll updates via PollSyncManager
    const handlePollUpdatedViaSyncManager = (payload: PollSyncPayload) => {
        console.log(`📊 [ChannelContext] Processing poll update via SyncManager:`, {
            channelId: payload.channelId,
            pollId: payload.updatedPoll.id,
            totalVoters: payload.updatedPoll.totalVoters
        });

        // Use PollStateManager to handle the remote update
        const pollStateManager = PollStateManager.getInstance();

        // Let PollStateManager handle the remote update
        // This will notify all subscribers (PollMessage components) automatically
        pollStateManager.handleRemoteUpdate(payload.updatedPoll, payload.voter?.id);

        // Update the channel messages as well for consistency
        setChannels(prev => {
            return prev.map(channel => {
                if (channel.id === payload.channelId) {
                    console.log(`🎯 Found target channel ${payload.channelId} for poll update`);

                    // Find and update the poll message
                    let pollUpdated = false;
                    const updatedMessages = channel.messages.map(message => {
                        if (message.poll && message.poll.id === payload.updatedPoll.id) {
                            console.log(`✅ Updating poll in message ${message.id}`);
                            pollUpdated = true;

                            return {
                                ...message,
                                poll: {
                                    ...payload.updatedPoll,
                                    createdAt: new Date(payload.updatedPoll.createdAt),
                                    endTime: payload.updatedPoll.endTime ? new Date(payload.updatedPoll.endTime) : undefined,
                                    options: payload.updatedPoll.options.map((option: any) => ({
                                        ...option,
                                        votes: option.votes.map((vote: any) => ({
                                            ...vote,
                                            votedAt: new Date(vote.votedAt)
                                        }))
                                    }))
                                }
                            };
                        }
                        return message;
                    });

                    if (pollUpdated) {
                        console.log(`🎉 Poll updated successfully in channel ${payload.channelId}`);
                        return { ...channel, messages: updatedMessages };
                    } else {
                        console.error(`❌ Poll ${payload.updatedPoll.id} not found in channel ${payload.channelId}`);
                        return channel;
                    }
                }
                return channel;
            });
        });
    };

    const addChannel = (
        channelData: Omit<Channel, 'id' | 'createdAt' | 'members' | 'messages' | 'invitations'>,
        creatorUser?: { id: string; name: string; avatar?: string }
    ): string => {
        const channelId = channelData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const newChannel: Channel = {
            ...channelData,
            id: channelId,
            createdAt: new Date(),
            members: [
                {
                    id: creatorUser?.id || 'current-user',
                    name: creatorUser?.name || 'Bạn',
                    avatar: creatorUser?.avatar,
                    status: 'online',
                    joinedAt: new Date()
                }
            ],
            messages: [], // No welcome message
            invitations: []
        };

        setChannels(prev => [newChannel, ...prev]);
        return channelId;
    };

    const getChannel = (id: string) => {
        return channels.find(channel => channel.id === id);
    };

    const updateChannel = (id: string, updates: Partial<Channel>) => {
        // Update channel locally first (for immediate UI update)
        setChannels(prev => prev.map(channel =>
            channel.id === id ? { ...channel, ...updates } : channel
        ));

        // Show notification for the person who updated (unified toast)
        const updateMessages = [];
        if (updates.name) updateMessages.push('tên kênh');
        if (updates.image) updateMessages.push('ảnh đại diện');
        if (updates.description) updateMessages.push('mô tả');

        const updateText = updateMessages.join(', ');

        toast({
            title: "✅ Đã cập nhật kênh",
            description: `Bạn đã thay đổi ${updateText} thành công`,
        });

        // Broadcast channel update via Socket.io (this will be received by OTHER users, not sender)
        if (socket && currentUser) {
            console.log('📤 Broadcasting channel update via socket:', { channelId: id, updates });
            socket.emit('updateChannelInfo', {
                channelId: id,
                updates,
                updatedBy: {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                }
            });
        }
    };

    const deleteChannel = (id: string) => {
        setChannels(prev => prev.filter(channel => channel.id !== id));
    };

    const addMessageToChannel = (channelId: string, messageData: Omit<ChannelMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChannelMessage = {
            ...messageData,
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            timestamp: new Date()
        };

        console.log('💬 Adding message to channel locally:', newMessage);
        console.log('📎 Message type:', newMessage.type);
        console.log('📁 File data:', newMessage.fileData);

        // Add message locally first (for immediate UI update)
        setChannels(prev => prev.map(channel =>
            channel.id === channelId
                ? { ...channel, messages: [...channel.messages, newMessage] }
                : channel
        ));

        // Broadcast message via Socket.io (this will be received by OTHER users, not sender)
        if (socket) {
            console.log('📤 Broadcasting message via socket:', newMessage);
            socket.emit('sendChannelMessage', {
                channelId,
                message: newMessage,
                senderId: messageData.sender.id
            });
        }
    };

    // Member management functions
    const inviteMemberToChannel = async (
        channelId: string,
        inviteeId: string,
        inviteeName: string,
        inviterId: string,
        inviterName: string,
        inviterAvatar?: string
    ): Promise<{ success: boolean; error?: string }> => {
        console.log('inviteMemberToChannel called with:', {
            channelId,
            inviteeId,
            inviteeName,
            inviterId,
            inviterName,
            inviterAvatar
        });

        try {
            const channel = getChannel(channelId);
            if (!channel) {
                console.error('Channel not found:', channelId);
                return { success: false, error: 'Kênh không tồn tại' };
            }

            console.log('Found channel:', channel);
            console.log('🖼️ Channel image before creating invitation:', channel.image);

            // Check if user is already a member
            const isAlreadyMember = channel.members.some(member => member.id === inviteeId);
            if (isAlreadyMember) {
                console.log('User is already a member:', inviteeId);
                return { success: false, error: 'Người dùng đã là thành viên của kênh' };
            }

            // Check if invitation already exists using service
            const existingInvitationCheck = await InvitationService.checkExistingInvitation(channelId, inviteeId);
            if (!existingInvitationCheck.success) {
                console.error('Error checking existing invitation:', existingInvitationCheck.error);
                return { success: false, error: 'Không thể kiểm tra lời mời hiện tại' };
            }

            if (existingInvitationCheck.data) {
                console.log('Existing invitation found:', existingInvitationCheck.data);
                return { success: false, error: 'Đã có lời mời đang chờ xử lý' };
            }

            // Create new invitation using service
            const newInvitationData = {
                channelId,
                channelName: channel.name,
                channelImage: channel.image, // Add channel image to invitation data
                inviterId,
                inviterName,
                inviterAvatar,
                inviteeId,
                inviteeName,
                status: 'pending' as const
            };

            const createInvitationResult = await InvitationService.createInvitation(newInvitationData);
            if (!createInvitationResult.success) {
                console.error('Failed to create invitation:', createInvitationResult.error);
                return { success: false, error: createInvitationResult.error || 'Không thể tạo lời mời' };
            }

            const savedInvitation = createInvitationResult.data;
            console.log('Invitation created successfully:', savedInvitation);
            console.log('🖼️ Saved invitation channelImage:', savedInvitation.channelImage);

            // Update local state
            setChannels(prev => prev.map(ch =>
                ch.id === channelId
                    ? { ...ch, invitations: [...ch.invitations, savedInvitation] }
                    : ch
            ));

            // Send notification via service
            const notificationResult = NotificationService.sendChannelInvitationNotification(
                socket,
                inviteeId,
                savedInvitation
            );

            if (!notificationResult.success) {
                console.warn('Failed to send notification:', notificationResult.error);
                // Don't fail the entire operation if notification fails
            }

            console.log('Invitation sent successfully');
            return { success: true };
        } catch (error) {
            console.error('Error inviting member:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' };
        }
    };

    const acceptChannelInvitation = async (
        invitationId: string,
        channelId: string,
        userId: string,
        userName: string,
        userAvatar?: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('acceptChannelInvitation called with:', {
                invitationId,
                channelId,
                userId,
                userName,
                userAvatar
            });

            // First, get invitation data from localStorage to ensure we have the latest data
            const invitationResult = await InvitationService.getUserInvitations(userId);
            if (!invitationResult.success) {
                console.error('Failed to get user invitations:', invitationResult.error);
                return { success: false, error: 'Không thể lấy thông tin lời mời' };
            }

            console.log('All user invitations:', invitationResult.data);
            const invitation = invitationResult.data.find((inv: any) => inv.id === invitationId);
            if (!invitation) {
                console.error('Invitation not found:', invitationId, 'in', invitationResult.data);
                return { success: false, error: 'Lời mời không tồn tại' };
            }

            console.log('Found invitation:', invitation);
            console.log('🖼️ Invitation channelImage:', invitation.channelImage);

            // Check if invitation is still pending
            if (invitation.status !== 'pending') {
                console.error('Invitation status is not pending:', invitation.status);
                return { success: false, error: 'Lời mời đã được xử lý' };
            }

            // Check if channel exists locally
            let channel = getChannel(channelId);

            // If channel doesn't exist locally, we need to create it from invitation data
            if (!channel) {
                console.log('Channel not found locally, creating from invitation data...');
                console.log('🖼️ Channel image from invitation:', invitation.channelImage);

                // Create channel for this user with ALL current members (including inviter)
                const newChannel: Channel = {
                    id: channelId,
                    name: invitation.channelName,
                    description: `Kênh được tạo bởi ${invitation.inviterName}`,
                    image: invitation.channelImage, // Use channel image from invitation
                    createdAt: new Date(invitation.createdAt),
                    members: [
                        // Add the inviter first
                        {
                            id: invitation.inviterId,
                            name: invitation.inviterName,
                            avatar: invitation.inviterAvatar,
                            status: 'online',
                            joinedAt: new Date(invitation.createdAt)
                        },
                        // Add the current user (invitee)
                        {
                            id: userId,
                            name: userName,
                            avatar: userAvatar,
                            status: 'online',
                            joinedAt: new Date()
                        }
                    ],
                    messages: [], // No welcome message
                    invitations: [invitation]
                };

                // Add channel to local state
                setChannels(prev => [...prev, newChannel]);
                channel = newChannel;

                console.log('Created channel for user:', newChannel);
                console.log('🖼️ New channel image set to:', newChannel.image);
            } else {
                // Channel exists, check if user is already a member
                const isAlreadyMember = channel.members.some(member => member.id === userId);
                if (isAlreadyMember) {
                    console.log('User is already a member of this channel');
                    // Still proceed to update invitation status
                } else {
                    // Add member to existing channel
                    const newMember: ChannelMember = {
                        id: userId,
                        name: userName,
                        avatar: userAvatar,
                        status: 'online',
                        joinedAt: new Date()
                    };

                    // Update channel: add member
                    setChannels(prev => prev.map(ch =>
                        ch.id === channelId
                            ? {
                                ...ch,
                                members: [...ch.members, newMember]
                            }
                            : ch
                    ));

                    console.log('Added member to existing channel:', newMember);
                }
            }

            // Update invitation status using service
            const updateResult = await InvitationService.updateInvitationStatus(invitationId, 'accepted');
            if (!updateResult.success) {
                console.error('Failed to update invitation status in localStorage:', updateResult.error);
                return { success: false, error: updateResult.error || 'Không thể cập nhật trạng thái lời mời' };
            }

            // Notify inviter via Socket.io
            if (socket) {
                const socketPayload = {
                    inviterId: invitation.inviterId,
                    payload: {
                        invitationId,
                        channelId,
                        inviteeId: userId,
                        inviteeName: userName,
                        inviteeAvatar: userAvatar,
                        channelName: invitation.channelName,
                        channelImage: invitation.channelImage // Include channel image in broadcast
                    }
                };
                console.log('📤 Emitting acceptChannelInvitation with payload:', socketPayload);
                socket.emit('acceptChannelInvitation', socketPayload);
            }

            console.log('Invitation accepted successfully');
            return { success: true };
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' };
        }
    };

    const declineChannelInvitation = async (invitationId: string, channelId?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Update invitation status in all channels
            setChannels(prev => prev.map(channel => ({
                ...channel,
                invitations: channel.invitations.map(inv =>
                    inv.id === invitationId
                        ? { ...inv, status: 'declined' as const }
                        : inv
                )
            })));

            // Update invitation status using service
            const updateResult = await InvitationService.updateInvitationStatus(invitationId, 'declined');
            if (!updateResult.success) {
                console.error('Failed to update invitation status in localStorage:', updateResult.error);
                return { success: false, error: updateResult.error || 'Không thể cập nhật trạng thái lời mời' };
            }

            // Find invitation to get inviter info
            const invitation = channels.flatMap(channel => channel.invitations).find(inv => inv.id === invitationId);

            // Notify inviter via Socket.io
            if (socket && invitation) {
                socket.emit('declineChannelInvitation', {
                    inviterId: invitation.inviterId,
                    payload: {
                        invitationId,
                        channelId,
                        inviteeId: invitation.inviteeId,
                        inviteeName: invitation.inviteeName,
                        channelName: invitation.channelName
                    }
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error declining invitation:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' };
        }
    };

    const removeMemberFromChannel = (channelId: string, memberId: string) => {
        setChannels(prev => prev.map(channel =>
            channel.id === channelId
                ? { ...channel, members: channel.members.filter(member => member.id !== memberId) }
                : channel
        ));
    };

    const getChannelInvitations = async (userId: string): Promise<ChannelInvitation[]> => {
        try {
            const result = await InvitationService.getUserInvitations(userId);
            if (result.success) {
                return result.data.filter((inv: any) => inv.status === 'pending');
            } else {
                console.error('Failed to get user invitations:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error getting user invitations:', error);
            return [];
        }
    };

    const value: ChannelContextType = {
        channels,
        addChannel,
        getChannel,
        updateChannel,
        deleteChannel,
        addMessageToChannel,
        inviteMemberToChannel,
        acceptChannelInvitation,
        declineChannelInvitation,
        removeMemberFromChannel,
        getChannelInvitations
    };

    return (
        <ChannelContext.Provider value={value}>
            {children}
        </ChannelContext.Provider>
    );
}

export function useChannels() {
    const context = useContext(ChannelContext);
    if (context === undefined) {
        throw new Error('useChannels must be used within a ChannelProvider');
    }
    return context;
} 