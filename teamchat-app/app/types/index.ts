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
    text: string;
    votes: number;
    voters: string[];
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
    onSendMessage: (text: string) => void;
    isDarkMode?: boolean;
    onCreatePoll?: (pollData: { question: string; options: string[] }) => void;
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