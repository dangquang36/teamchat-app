export interface Message {
    id: string;
    from: string;
    text?: string;
    time: string;
    type?: string;
    poll?: {
        question: string;
        options: { text: string; votes: number }[];
        voters: string[];
    };
}

export interface DirectMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    avatar: string;
    online: boolean;
}

export interface UserProfile {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
}

export interface ChatMessagesProps {
    messages: Message[];
    currentUser: UserProfile;
    isDarkMode?: boolean;
}

export interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isDarkMode?: boolean;
}