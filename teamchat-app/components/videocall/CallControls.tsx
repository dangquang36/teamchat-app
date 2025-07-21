'use client';

import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CallControlsProps {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onLeave: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
    isAudioEnabled,
    isVideoEnabled,
    onToggleAudio,
    onToggleVideo,
    onLeave,
}) => {
    const { isDarkMode } = useTheme();

    // Định nghĩa các lớp CSS cho nút để dễ quản lý
    const baseButtonClass = "p-3 rounded-full text-white transition-colors";
    const activeButtonClass = isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600';
    const inactiveButtonClass = 'bg-red-500 hover:bg-red-600';

    return (
        <div className="flex justify-center space-x-4">
            {/* Nút bật/tắt Mic */}
            <button
                onClick={onToggleAudio}
                className={`${baseButtonClass} ${isAudioEnabled ? activeButtonClass : inactiveButtonClass}`}
                title={isAudioEnabled ? "Tắt mic" : "Bật mic"}
            >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* Nút bật/tắt Video */}
            <button
                onClick={onToggleVideo}
                className={`${baseButtonClass} ${isVideoEnabled ? activeButtonClass : inactiveButtonClass}`}
                title={isVideoEnabled ? "Tắt camera" : "Bật camera"}
            >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {/* Nút rời khỏi cuộc gọi */}
            <button
                onClick={onLeave}
                className={`${baseButtonClass} bg-red-600 hover:bg-red-500`}
                title="Kết thúc cuộc gọi"
            >
                <PhoneOff className="w-6 h-6" />
            </button>
        </div>
    );
};
