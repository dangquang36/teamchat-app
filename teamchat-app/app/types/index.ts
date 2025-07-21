export interface Group {
    id: string;
    name: string;
    members: number;
    pinnedMessages: boolean;
}


interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    isDarkMode?: boolean;
}


export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    coverPhotoUrl: string;
    phone: string;
    email: string;
    birthday: string;
    socialProfiles: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
    };
    mutualGroups: number;
}
export interface Reaction {
    emoji: string;
    user: string; // 'me' hoặc id của người dùng khác
}

export interface DirectMessage {
    id: string;
    name: string;
    message: string;
    avatar: string;
    online: boolean;
}

export interface ChatHeaderProps {
    user: {
        name: string;
        online: boolean;
        avatar: string;
    };
    onVideoCall: () => void;
    onAudioCall: () => void;
    onViewProfile: () => void;
    isDarkMode?: boolean;
}



export interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isDarkMode?: boolean;
}

export interface SidebarIconProps {
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    tooltip: string;
    badge?: string;
}

export interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface ExtendedMessage {
    id: string;
    from: string;
    text?: string;
    time: string;
    type?: string;
}

// Thêm vào file types.ts hiện tại của bạn

export interface PollOption {
    text: string;
    votes: number;
    voters: string[]; // Danh sách user đã vote
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    allowMultipleVotes?: boolean;
    createdBy: string;
    createdAt: string;
    expiresAt?: string; // Thời gian hết hạn (optional)
}

export interface PollMessage extends Message {
    type: 'poll';
    poll: Poll;
}

// Cập nhật interface Message để hỗ trợ các loại tin nhắn khác nhau
export interface Message {
    id: string;
    from: string;
    time: string;
    reactions: Reaction[];
    type?: 'text' | 'poll' | 'file' | 'image';
    text?: string; // Chỉ có khi type = 'text'
    poll?: Poll;   // Chỉ có khi type = 'poll'
    fileUrl?: string; // Chỉ có khi type = 'file' hoặc 'image'
    fileName?: string;
}

// Thêm vào file types/index.ts hoặc file tương tự

export interface Reaction {
    emoji: string;
    user: string;
}

export interface Message {
    id: string;
    from: string;
    text?: string;
    time: string;
    reactions: Reaction[];
    type?: 'text' | 'poll' | 'file' | 'image';
}

export interface PollOption {
    text: string;
    votes: number;
}

export interface Poll {
    question: string;
    options: PollOption[];
    voters: string[];
}

export interface ChannelMessage extends Message {
    type?: 'text' | 'poll';
    poll?: Poll;
}

export interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isDarkMode?: boolean;
    onCreatePoll?: (pollData: { question: string; options: string[] }) => void;
}


export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    coverPhotoUrl: string;
    phone: string;
    email: string;
    birthday: string;
    socialProfiles: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
    };
    mutualGroups: number;
}

export interface DirectMessage extends UserProfile {
    message: string;
}
export interface DirectMessage extends UserProfile {
    message: string;
    online: boolean;
}
