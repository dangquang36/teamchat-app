import { useEffect, useState } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useChannels } from '@/contexts/ChannelContext';
import { ChannelInvitation } from '@/contexts/ChannelContext';
import { InvitationService } from '@/services/invitationService';

export function useRealTimeUpdates() {
    const { socket } = useSocketContext();
    const currentUser = useCurrentUser();
    const { getChannelInvitations } = useChannels();
    const [pendingInvitations, setPendingInvitations] = useState<ChannelInvitation[]>([]);
    const [hasNewInvitations, setHasNewInvitations] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial invitations
    useEffect(() => {
        if (!currentUser) return;

        const fetchInvitations = async () => {
            setIsLoading(true);
            try {
                const invitations = await getChannelInvitations(currentUser.id);
                const pendingOnly = invitations.filter(inv => inv.status === 'pending');
                setPendingInvitations(pendingOnly);
                setHasNewInvitations(pendingOnly.length > 0);
                console.log('Fetched pending invitations:', pendingOnly);
            } catch (error) {
                console.error('Error fetching invitations:', error);
                setPendingInvitations([]);
                setHasNewInvitations(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvitations();
    }, [currentUser, getChannelInvitations]);

    // Listen for real-time invitation updates
    useEffect(() => {
        if (!socket || !currentUser) return;

        const handleChannelInvitationReceived = async (invitation: ChannelInvitation) => {
            console.log('🔔 Received channel invitation:', invitation);
            console.log('🖼️ Received invitation channelImage:', invitation.channelImage);

            // Only process if it's for the current user
            if (invitation.inviteeId === currentUser.id) {
                console.log('💾 Checking existing invitations first...');

                // Check if invitation already exists in local state to avoid duplicates
                const alreadyInLocalState = pendingInvitations.some(inv =>
                    String(inv.channelId) === String(invitation.channelId) &&
                    String(inv.inviteeId) === String(invitation.inviteeId) &&
                    inv.status === 'pending'
                );

                if (alreadyInLocalState) {
                    console.log('⚠️ Invitation already exists in local state, skipping:', invitation);
                    return;
                }

                // Check if invitation already exists in localStorage to avoid duplicates
                const existingCheck = await InvitationService.checkExistingInvitation(invitation.channelId, invitation.inviteeId);
                if (existingCheck.success && existingCheck.data) {
                    console.log('⚠️ Invitation already exists in localStorage, updating local state with existing:', existingCheck.data);

                    // Use existing invitation
                    setPendingInvitations(prev => {
                        const exists = prev.some(inv => inv.id === existingCheck.data.id);
                        if (!exists) {
                            setHasNewInvitations(true);
                            return [...prev, existingCheck.data];
                        }
                        return prev;
                    });
                    return;
                }

                console.log('💾 Saving new invitation to localStorage for recipient...');

                // Create new invitation in localStorage for the recipient
                const saveResult = await InvitationService.createInvitation({
                    channelId: invitation.channelId,
                    channelName: invitation.channelName,
                    channelImage: invitation.channelImage, // ✅ Include channel image
                    inviterId: invitation.inviterId,
                    inviterName: invitation.inviterName,
                    inviterAvatar: invitation.inviterAvatar,
                    inviteeId: invitation.inviteeId,
                    inviteeName: invitation.inviteeName,
                    status: 'pending'
                });

                if (saveResult.success) {
                    console.log('✅ Invitation saved to recipient localStorage:', saveResult.data);
                    console.log('🖼️ Saved invitation channelImage:', saveResult.data.channelImage);

                    // Update local state with the saved invitation (which has proper ID)
                    setPendingInvitations(prev => {
                        const exists = prev.some(inv => inv.id === saveResult.data.id);
                        if (!exists) {
                            setHasNewInvitations(true);
                            return [...prev, saveResult.data];
                        }
                        return prev;
                    });
                } else {
                    console.error('❌ Failed to save invitation to recipient localStorage:', saveResult.error);

                    // Fallback: still add to local state even if localStorage save failed
                    setPendingInvitations(prev => {
                        const exists = prev.some(inv => inv.id === invitation.id);
                        if (!exists) {
                            setHasNewInvitations(true);
                            return [...prev, invitation];
                        }
                        return prev;
                    });
                }
            }
        };

        const handleChannelInvitationAccepted = (payload: any) => {
            console.log('Channel invitation accepted:', payload);

            // Remove from pending invitations if it's for the current user
            if (payload.inviteeId === currentUser.id) {
                setPendingInvitations(prev =>
                    prev.filter(inv => inv.id !== payload.invitationId)
                );

                // Update hasNewInvitations
                setHasNewInvitations(prev => {
                    const remaining = pendingInvitations.filter(inv => inv.id !== payload.invitationId);
                    return remaining.length > 0;
                });
            }
        };

        const handleChannelInvitationDeclined = (payload: any) => {
            console.log('Channel invitation declined:', payload);

            // Remove from pending invitations if it's for the current user
            if (payload.inviteeId === currentUser.id) {
                setPendingInvitations(prev =>
                    prev.filter(inv => inv.id !== payload.invitationId)
                );

                // Update hasNewInvitations
                setHasNewInvitations(prev => {
                    const remaining = pendingInvitations.filter(inv => inv.id !== payload.invitationId);
                    return remaining.length > 0;
                });
            }
        };

        // Listen for invitation events
        socket.on('channelInvitationReceived', handleChannelInvitationReceived);
        socket.on('channelInvitationAccepted', handleChannelInvitationAccepted);
        socket.on('channelInvitationDeclined', handleChannelInvitationDeclined);

        // Cleanup listeners
        return () => {
            socket.off('channelInvitationReceived', handleChannelInvitationReceived);
            socket.off('channelInvitationAccepted', handleChannelInvitationAccepted);
            socket.off('channelInvitationDeclined', handleChannelInvitationDeclined);
        };
    }, [socket, currentUser, pendingInvitations]);

    // Clear new invitation flag when user clicks notification
    const clearNewInvitationFlag = () => {
        setHasNewInvitations(false);
    };

    // Refresh invitations manually
    const refreshInvitations = async () => {
        if (!currentUser) return;

        setIsLoading(true);
        try {
            const invitations = await getChannelInvitations(currentUser.id);
            const pendingOnly = invitations.filter(inv => inv.status === 'pending');
            setPendingInvitations(pendingOnly);
            setHasNewInvitations(pendingOnly.length > 0);
        } catch (error) {
            console.error('Error refreshing invitations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        pendingInvitations,
        hasNewInvitations,
        clearNewInvitationFlag,
        invitationCount: pendingInvitations.length,
        isLoading,
        refreshInvitations
    };
} 