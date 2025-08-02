// Dán toàn bộ code này vào file types của bạn (ví dụ: app/types/index.ts)

// -- CÁC KIỂU DỮ LIỆU CỐT LÕI --



export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    online: boolean; // Thêm `online` vào đây để làm kiểu cơ sở
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

// DirectMessage giờ sẽ kế thừa từ UserProfile một cách nhất quán
export interface DirectMessage extends UserProfile {
    message: string;
}

export interface Reaction {
    emoji: string;
    user: string;
}

export interface PollOption {
    id: string;
    text: string;
    votes: PollVote[];
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    allowMultipleVotes?: boolean;
    createdBy: string;
    createdAt: string;
    voters: string[];
    description?: string;
    allowMultiple: boolean;
    isAnonymous: boolean;
    showResults: "always" | "after_vote" | "after_end";
    createdByName: string;
    endTime?: Date;
    isActive: boolean;
    totalVoters: number;
}

export interface MessageWithPoll extends Message {
    poll?: Poll;
    files?: { name: string; size: number }[];
}

// Thống nhất lại một interface Message duy nhất và đầy đủ nhất
export interface Message {
    id: string;
    from: string;
    time: string;
    reactions: Reaction[];
    type?: 'text' | 'poll' | 'file' | 'image';
    text?: string;
    poll?: Poll;
    fileUrl?: string;
    fileName?: string;
    attachments?: { name: string; url: string; type: string; size: number }[];
    // Thêm tính năng reply
    replyTo?: {
        id: string;
        from: string;
        text?: string;
        type?: 'text' | 'poll' | 'file' | 'image';
    };
}



export interface Post {
    id: string
    author: {
        id: string
        name: string
        avatar: string
        title?: string
        verified?: boolean
    }
    title: string // Added title field
    content: string
    plainTextContent?: string // Added for search functionality
    images?: string[]
    video?: string
    timestamp: number
    createdAt: string // Added ISO date string
    updatedAt: string // Added ISO date string
    likes: number
    comments: number
    shares: number
    bookmarks?: number
    isLiked: boolean
    isBookmarked: boolean
    visibility: "public" | "friends" | "private" | "channels" // Added channels visibility
    sharedChannels?: string[] // Added for channel-specific sharing
    tags?: string[]
    location?: string
    attachments?: { type: "file"; name: string; url: string }[]
}

export interface Comment {
    id: string
    postId: string
    parentId?: string
    author: {
        id: string
        name: string
        avatar: string
    }
    content: string
    timestamp: number
    likes: number
    replies?: Comment[]
    isLiked: boolean
}

// -- CÁC KIỂU PROPS CHO COMPONENT --

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
    onCreatePoll?: (pollData: { question: string; options: string[] }) => void;
    onSendMessage: (message: string, files: File[]) => void;
    isDarkMode?: boolean;
    // Thêm props cho reply
    replyingTo?: {
        id: string;
        from: string;
        text?: string;
        type?: 'text' | 'poll' | 'file' | 'image';
    } | null;
    onCancelReply?: () => void;
}


export interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile; // Có thể dùng một kiểu người dùng đơn giản hơn nếu muốn
    isDarkMode?: boolean;
    onVote: (messageId: string, optionIndex: number) => void;
    onToggleReaction: (messageId: string, emoji: string) => void;
}

export interface UserProfileModalProps {
    user: UserProfile;
    onClose: () => void;
    onSendMessage: (userId: string) => void;
    onStartCall: (user: UserProfile) => void;
    isDarkMode?: boolean;
}

// -- CÁC KIỂU KHÁC --

export interface Group {
    id: string;
    name: string;
    members: number;
    pinnedMessages: boolean;
}

export interface PollVote {
    userId: string;
    userName: string;
    userAvatar: string;
    votedAt: Date;
}
