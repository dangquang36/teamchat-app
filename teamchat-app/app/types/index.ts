export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
    gender?: string;
    dob?: string;
    phone?: string;
    email?: string;
}

export interface Message {
    from: string;
    text: string;
    time: string;
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

export interface ChatMessagesProps {
    messages: Message[];
    currentUser: {
        id: string;
        name: string;
        avatar: string;
    };
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