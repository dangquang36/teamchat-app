

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


export interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isDarkMode?: boolean;
}