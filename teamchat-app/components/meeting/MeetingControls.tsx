'use client';

import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface MeetingControlsProps {
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    isScreenSharing: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    onLeaveRoom: () => void;
}

// Component ControlButton không thay đổi nhiều, chỉ cần bỏ TooltipProvider
const ControlButton = ({
    children,
    isActive,
    isDestructive = false,
    tooltip,
    onClick,
    className = ""
}: {
    children: React.ReactNode;
    isActive?: boolean;
    isDestructive?: boolean;
    tooltip: string;
    onClick: () => void;
    className?: string;
}) => {
    // SỬA LỖI: Xóa <TooltipProvider> ra khỏi đây.
    // Mỗi Tooltip chỉ cần nằm trong một Provider chung.
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="lg"
                    onClick={onClick}
                    className={`
                        w-14 h-14 p-0 rounded-full border-2 backdrop-blur-md transition-all duration-200 
                        hover:scale-105 active:scale-95
                        ${isDestructive
                            ? 'bg-red-500/20 hover:bg-red-500 border-red-500/50 hover:border-red-500 text-red-400 hover:text-white shadow-lg shadow-red-500/20'
                            : isActive
                                ? 'bg-blue-500/20 hover:bg-blue-500 border-blue-500/50 hover:border-blue-500 text-blue-400 hover:text-white shadow-lg shadow-blue-500/20'
                                : 'bg-gray-700/50 hover:bg-gray-600 border-gray-600/50 hover:border-gray-500 text-gray-300 hover:text-white shadow-lg'
                        }
                        ${className}
                    `}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
};


export default function MeetingControls({
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onLeaveRoom
}: MeetingControlsProps) {
    const [showConfirmLeave, setShowConfirmLeave] = useState(false);

    const handleLeaveConfirm = () => {
        setShowConfirmLeave(false);
        onLeaveRoom();
    };

    return (
        <>
            {/* Meeting Controls Bar */}
            <div className="relative bg-gray-800/60 backdrop-blur-xl border-t border-gray-700/50">
                <div className="relative z-10 px-8 py-4">
                    {/* SỬA LỖI: Bọc toàn bộ các nút trong một <TooltipProvider> duy nhất. */}
                    <TooltipProvider>
                        <div className="flex items-center justify-center space-x-4">
                            {/* Microphone Control */}
                            <ControlButton
                                tooltip={isMicEnabled ? "Tắt micro" : "Bật micro"}
                                isActive={!isMicEnabled}
                                isDestructive={!isMicEnabled}
                                onClick={onToggleMic}
                            >
                                {isMicEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                            </ControlButton>

                            {/* Camera Control */}
                            <ControlButton
                                tooltip={isCameraEnabled ? "Tắt camera" : "Bật camera"}
                                isActive={!isCameraEnabled}
                                isDestructive={!isCameraEnabled}
                                onClick={onToggleCamera}
                            >
                                {isCameraEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                            </ControlButton>

                            {/* Screen Share Control */}
                            <ControlButton
                                tooltip={isScreenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
                                isActive={isScreenSharing}
                                onClick={onToggleScreenShare}
                            >
                                {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                            </ControlButton>

                            {/* Leave Meeting Button */}
                            <div className="ml-6">
                                <ControlButton
                                    tooltip="Rời cuộc họp"
                                    isDestructive={true}
                                    onClick={() => setShowConfirmLeave(true)}
                                    className="shadow-2xl shadow-red-500/30 bg-red-500 hover:bg-red-600 text-white"
                                >
                                    <Phone className="h-6 w-6 transform rotate-[135deg]" />
                                </ControlButton>
                            </div>
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            {/* Leave Confirmation Modal */}
            {showConfirmLeave && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setShowConfirmLeave(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-700 transition-transform duration-300 animate-in slide-in-from-bottom-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                                <Phone className="h-8 w-8 text-red-600 dark:text-red-400 transform rotate-[135deg]" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Rời khỏi cuộc họp?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-8">
                                Bạn có chắc chắn muốn rời khỏi cuộc họp này không?
                            </p>
                            <div className="flex space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmLeave(false)}
                                    className="flex-1 h-12 dark:border-gray-600 dark:hover:bg-gray-700"
                                >
                                    Ở lại
                                </Button>
                                <Button
                                    onClick={handleLeaveConfirm}
                                    className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Rời cuộc họp
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}