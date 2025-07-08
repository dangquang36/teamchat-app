export interface VideoCallRoom {
    roomName: string;
    participants: string[];
    isActive: boolean;
}

export interface VideoCallState {
    isConnected: boolean;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    participants: string[];
    currentRoom: string | null;
}

export interface CallNotification {
    from: string;
    roomName: string;
    type: 'incoming' | 'missed' | 'ended';
}