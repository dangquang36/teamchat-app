"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import { InvitationService } from '@/services/invitationService';
import { NotificationService } from '@/services/notificationService';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
    type: 'text' | 'image' | 'file' | 'meeting';
    meetingData?: {
        title: string;
        roomName: string;
        createdBy: string;
        createdById: string;
        channelId: string;
        channelName: string;
        joinUrl?: string;
    };
}

export interface ChannelInvitation {
    id: string;
    channelId: string;
    channelName: string;
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
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();

    // Load channels from localStorage on mount
    useEffect(() => {
        const savedChannels = localStorage.getItem('channels');
        if (savedChannels) {
            try {
                const parsedChannels = JSON.parse(savedChannels);
                // Convert string dates back to Date objects
                const channelsWithDates = parsedChannels.map((channel: any) => ({
                    ...channel,
                    createdAt: new Date(channel.createdAt),
                    members: channel.members.map((member: any) => ({
                        ...member,
                        joinedAt: new Date(member.joinedAt || channel.createdAt)
                    })),
                    messages: channel.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    })),
                    invitations: (channel.invitations || []).map((inv: any) => ({
                        ...inv,
                        createdAt: new Date(inv.createdAt)
                    }))
                }));
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

    // Socket.io listeners for channel invitations - DISABLED to avoid duplicate processing
    useEffect(() => {
        if (!socket) return;

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
            // Update invitation status AND add member to channel for all users
            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? {
                        ...channel,
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

            // Skip if this is my own message (to prevent duplicates)
            if (currentUser && message.sender.id === currentUser.id) {
                console.log('⚠️ Skipping own message to prevent duplicate:', message.id);
                return;
            }

            // Check if message already exists to prevent duplicates
            setChannels(prev => prev.map(channel => {
                if (channel.id === channelId) {
                    const messageExists = channel.messages.some(msg => msg.id === message.id);
                    if (messageExists) {
                        console.log('⚠️ Message already exists, skipping:', message.id);
                        return channel;
                    }
                    return { ...channel, messages: [...channel.messages, message] };
                }
                return channel;
            }));
        };

        // Handle member joined broadcast
        const handleChannelMemberJoined = (payload: any) => {
            console.log('👥 Channel member joined broadcast:', payload);

            setChannels(prev => prev.map(channel =>
                channel.id === payload.channelId
                    ? {
                        ...channel,
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
                    avatar: payload.creatorAvatar || '/placeholder-user.jpg'
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

        socket.on('channelMessageReceived', handleChannelMessageReceived);
        socket.on('channelMemberJoined', handleChannelMemberJoined);
        socket.on('meetingNotificationReceived', handleMeetingNotificationReceived);

        return () => {
            socket.off('channelInvitationReceived', handleChannelInvitationReceived);
            socket.off('channelInvitationAccepted', handleChannelInvitationAccepted);
            socket.off('channelInvitationDeclined', handleChannelInvitationDeclined);
            socket.off('channelMessageReceived', handleChannelMessageReceived);
            socket.off('channelMemberJoined', handleChannelMemberJoined);
            socket.off('meetingNotificationReceived', handleMeetingNotificationReceived);
        };
    }, [socket]);

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
                    avatar: creatorUser?.avatar || '/placeholder-user.jpg',
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
        setChannels(prev => prev.map(channel =>
            channel.id === id ? { ...channel, ...updates } : channel
        ));
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
                userName
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

                // Create channel for this user with ALL current members (including inviter)
                const newChannel: Channel = {
                    id: channelId,
                    name: invitation.channelName,
                    description: `Kênh được tạo bởi ${invitation.inviterName}`,
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
                socket.emit('acceptChannelInvitation', {
                    inviterId: invitation.inviterId,
                    payload: {
                        invitationId,
                        channelId,
                        inviteeId: userId,
                        inviteeName: userName,
                        inviteeAvatar: userAvatar,
                        channelName: invitation.channelName
                    }
                });
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