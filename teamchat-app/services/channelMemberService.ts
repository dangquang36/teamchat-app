export interface ChannelMember {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
    joinedAt: Date;
    role?: 'owner' | 'admin' | 'member';
}

export interface Channel {
    id: string;
    name: string;
    description: string;
    image?: string;
    createdAt: Date;
    members: ChannelMember[];
    messages: any[];
    invitations: any[];
}

export class ChannelMemberService {
    private static channels: Map<string, Channel> = new Map();

    /**
     * Thêm channel vào service
     */
    static addChannel(channel: Channel) {
        this.channels.set(channel.id, channel);
        console.log(`📋 ChannelMemberService: Added channel ${channel.id} with ${channel.members.length} members`);
    }

    /**
     * Cập nhật channel
     */
    static updateChannel(channelId: string, updates: Partial<Channel>) {
        const channel = this.channels.get(channelId);
        if (channel) {
            const updatedChannel = { ...channel, ...updates };
            this.channels.set(channelId, updatedChannel);
            console.log(`📋 ChannelMemberService: Updated channel ${channelId}`);
        }
    }

    /**
     * Xóa channel
     */
    static removeChannel(channelId: string) {
        this.channels.delete(channelId);
        console.log(`📋 ChannelMemberService: Removed channel ${channelId}`);
    }

    /**
     * Lấy danh sách thành viên của channel
     */
    static getChannelMembers(channelId: string): ChannelMember[] {
        const channel = this.channels.get(channelId);
        return channel ? channel.members : [];
    }

    /**
     * Kiểm tra user có phải thành viên của channel không
     */
    static isUserChannelMember(channelId: string, userId: string): boolean {
        const members = this.getChannelMembers(channelId);
        const isMember = members.some(member => member.id === userId);
        console.log(`🔍 ChannelMemberService: User ${userId} is ${isMember ? 'member' : 'not member'} of channel ${channelId}`);
        return isMember;
    }

    /**
     * Lấy danh sách ID của tất cả thành viên trong channel
     */
    static getChannelMemberIds(channelId: string): string[] {
        const members = this.getChannelMembers(channelId);
        return members.map(member => member.id);
    }

    /**
     * Thêm thành viên vào channel
     */
    static addMemberToChannel(channelId: string, member: ChannelMember) {
        const channel = this.channels.get(channelId);
        if (channel) {
            const existingMemberIndex = channel.members.findIndex(m => m.id === member.id);
            if (existingMemberIndex === -1) {
                channel.members.push(member);
                this.channels.set(channelId, channel);
                console.log(`👤 ChannelMemberService: Added member ${member.name} to channel ${channelId}`);
            }
        }
    }

    /**
     * Xóa thành viên khỏi channel
     */
    static removeMemberFromChannel(channelId: string, memberId: string) {
        const channel = this.channels.get(channelId);
        if (channel) {
            channel.members = channel.members.filter(member => member.id !== memberId);
            this.channels.set(channelId, channel);
            console.log(`👤 ChannelMemberService: Removed member ${memberId} from channel ${channelId}`);
        }
    }

    /**
     * Lấy thông tin channel
     */
    static getChannel(channelId: string): Channel | undefined {
        return this.channels.get(channelId);
    }

    /**
     * Lấy tất cả channels
     */
    static getAllChannels(): Channel[] {
        return Array.from(this.channels.values());
    }

    /**
     * Debug: In ra thông tin tất cả channels
     */
    static debugChannels() {
        console.log('📊 ChannelMemberService Debug:');
        this.channels.forEach((channel, id) => {
            console.log(`  Channel ${id}: ${channel.name} - ${channel.members.length} members`);
            channel.members.forEach(member => {
                console.log(`    - ${member.name} (${member.id})`);
            });
        });
    }
} 