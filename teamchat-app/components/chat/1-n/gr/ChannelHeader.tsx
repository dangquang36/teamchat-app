'use client';

import { Phone, Video, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChannelHeaderProps {
    channel: {
        id: string;
        name: string;
        members: number;
    };
    isDarkMode: boolean;
    onToggleDetails: () => void;
    onAudioCall: () => void;
    onVideoCall: () => void;
}

export function ChannelHeader({
    channel,
    isDarkMode,
    onToggleDetails,
    onAudioCall,
    onVideoCall,
}: ChannelHeaderProps) {
    return (
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}>
            <div>
                <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    # {channel.name}
                </h3>
                <p className="text-sm text-gray-500">{channel.members} thành viên</p>
            </div>

            <div className="flex items-center space-x-2">
                <Button
                    onClick={onAudioCall}
                    variant="ghost"
                    size="sm"
                    title="Thực hiện cuộc gọi thoại"
                >
                    <Phone className="h-5 w-5" />
                </Button>
                <Button
                    onClick={onVideoCall}
                    variant="ghost"
                    size="sm"
                    title="Thực hiện cuộc gọi video"
                >
                    <Video className="h-5 w-5" />
                </Button>
                <Button
                    onClick={onToggleDetails}
                    variant="ghost"
                    size="sm"
                    title="Xem thông tin kênh"
                >
                    <Info className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}