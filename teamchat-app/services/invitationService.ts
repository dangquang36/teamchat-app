import { ChannelInvitation } from '@/contexts/ChannelContext';

export interface InvitationServiceResponse {
    success: boolean;
    error?: string;
    data?: any;
}

export class InvitationService {
    private static STORAGE_KEY = 'channel_invitations';

    /**
     * Lấy tất cả invitations từ localStorage
     */
    private static getStoredInvitations(): ChannelInvitation[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const invitations = JSON.parse(stored);

            // Clean up invitations that don't have channelImage field (legacy data)
            const cleanedInvitations = invitations.map((inv: any) => ({
                ...inv,
                // Ensure channelImage field exists (even if undefined)
                channelImage: inv.channelImage
            }));

            return cleanedInvitations;
        } catch (error) {
            console.error('Error reading invitations from localStorage:', error);
            return [];
        }
    }

    /**
     * Lưu invitations vào localStorage
     */
    private static saveInvitations(invitations: ChannelInvitation[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(invitations));
        } catch (error) {
            console.error('Error saving invitations to localStorage:', error);
        }
    }

    /**
     * Tạo invitation mới và lưu vào localStorage
     */
    static async createInvitation(invitation: Omit<ChannelInvitation, 'id' | 'createdAt'>): Promise<InvitationServiceResponse> {
        try {
            console.log('🔔 Creating invitation:', invitation);
            console.log('🖼️ Creating invitation with channelImage:', invitation.channelImage);

            const newInvitation: ChannelInvitation = {
                ...invitation,
                id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                createdAt: new Date()
            };

            console.log('🎯 New invitation created with channelImage:', newInvitation.channelImage);

            // Lấy invitations hiện tại
            const currentInvitations = this.getStoredInvitations();
            console.log('📦 Current invitations in localStorage:', currentInvitations);

            // Thêm invitation mới
            const updatedInvitations = [...currentInvitations, newInvitation];

            // Lưu vào localStorage
            this.saveInvitations(updatedInvitations);
            console.log('💾 Updated invitations saved to localStorage:', updatedInvitations);

            // Verify the save worked
            const verifyInvitations = this.getStoredInvitations();
            console.log('✅ Verification - invitations after save:', verifyInvitations);

            console.log('🎉 Invitation saved successfully:', newInvitation);

            return {
                success: true,
                data: newInvitation
            };
        } catch (error) {
            console.error('❌ Error creating invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Cập nhật trạng thái invitation
     */
    static async updateInvitationStatus(invitationId: string, status: 'accepted' | 'declined'): Promise<InvitationServiceResponse> {
        try {
            console.log(`Updating invitation ${invitationId} status to ${status}`);

            // Lấy invitations hiện tại
            const currentInvitations = this.getStoredInvitations();

            // Tìm và cập nhật invitation
            const updatedInvitations = currentInvitations.map(inv =>
                inv.id === invitationId ? { ...inv, status } : inv
            );

            // Lưu vào localStorage
            this.saveInvitations(updatedInvitations);

            const updatedInvitation = updatedInvitations.find(inv => inv.id === invitationId);
            console.log('Invitation updated successfully:', updatedInvitation);

            return {
                success: true,
                data: updatedInvitation
            };
        } catch (error) {
            console.error('Error updating invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Lấy tất cả invitations cho một user
     */
    static async getUserInvitations(userId: string): Promise<InvitationServiceResponse> {
        try {
            console.log('🔍 Fetching invitations for user:', userId);

            const allInvitations = this.getStoredInvitations();
            console.log('📦 All invitations from localStorage:', allInvitations);
            console.log('📦 Total invitations count:', allInvitations.length);

            // Filter invitations for this user
            const userInvitations = allInvitations.filter((inv: any) => {
                const inviteeIdStr = String(inv.inviteeId);
                const userIdStr = String(userId);
                const match = inviteeIdStr === userIdStr;
                console.log(`🔍 Checking invitation ${inv.id}:`);
                console.log(`  - inviteeId: "${inv.inviteeId}" (type: ${typeof inv.inviteeId})`);
                console.log(`  - userId: "${userId}" (type: ${typeof userId})`);
                console.log(`  - inviteeIdStr: "${inviteeIdStr}"`);
                console.log(`  - userIdStr: "${userIdStr}"`);
                console.log(`  - match: ${match}`);
                return match;
            });
            console.log('✨ Filtered invitations for user:', userInvitations);
            console.log('✨ User invitations count:', userInvitations.length);

            return {
                success: true,
                data: userInvitations
            };
        } catch (error) {
            console.error('❌ Error fetching user invitations:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Kiểm tra xem user đã được mời vào channel chưa
     */
    static async checkExistingInvitation(channelId: string, inviteeId: string): Promise<InvitationServiceResponse> {
        try {
            console.log(`Checking existing invitation for channel ${channelId} and user ${inviteeId}`);

            const allInvitations = this.getStoredInvitations();

            // Tìm invitation đang pending cho user này trong channel này
            const existingInvitation = allInvitations.find((inv: any) => {
                const channelMatch = String(inv.channelId) === String(channelId);
                const inviteeMatch = String(inv.inviteeId) === String(inviteeId);
                const statusMatch = inv.status === 'pending';
                const fullMatch = channelMatch && inviteeMatch && statusMatch;

                console.log(`🔍 Checking existing invitation ${inv.id}:`);
                console.log(`  - channelId: "${inv.channelId}" vs "${channelId}" = ${channelMatch}`);
                console.log(`  - inviteeId: "${inv.inviteeId}" vs "${inviteeId}" = ${inviteeMatch}`);
                console.log(`  - status: "${inv.status}" = ${statusMatch}`);
                console.log(`  - full match: ${fullMatch}`);

                return fullMatch;
            });

            console.log('Existing invitation found:', existingInvitation);

            return {
                success: true,
                data: existingInvitation || null
            };
        } catch (error) {
            console.error('Error checking existing invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Clear all invitations (for debugging)
     */
    static clearAllInvitations(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('🧹 All invitations cleared from localStorage');
        } catch (error) {
            console.error('Error clearing invitations:', error);
        }
    }

    /**
     * Xóa invitation
     */
    static async deleteInvitation(invitationId: string): Promise<InvitationServiceResponse> {
        try {
            console.log(`Deleting invitation ${invitationId}`);

            const currentInvitations = this.getStoredInvitations();
            const updatedInvitations = currentInvitations.filter(inv => inv.id !== invitationId);

            this.saveInvitations(updatedInvitations);

            console.log('Invitation deleted successfully');

            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).clearInvitations = InvitationService.clearAllInvitations;
} 