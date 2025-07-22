

import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, Info } from "lucide-react";
import { DirectMessage } from "@/app/types";
import { VideoCallButton } from "../videocall/VideoCallButton";

export interface ChatHeaderProps {
    user: DirectMessage;
    onAudioCall: () => void;
    onViewProfile: () => void;
    isDetailsOpen: boolean;
    onToggleDetails: () => void;
    onCloseDetails: () => void;
    isDarkMode?: boolean;
}

export function ChatHeader({
    user,
    onAudioCall,
    onViewProfile,
    isDetailsOpen,
    onToggleDetails,
    onCloseDetails,
    isDarkMode = false,
}: ChatHeaderProps) {
    return (
        <div
            className={`flex items-center justify-between p-4 border-b transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
        >
            {isDetailsOpen ? (
                <>
                    <h3 className="font-semibold">Thông tin hội thoại</h3>

                </>
            ) : (
                <>
                    <button className="flex items-center text-left" onClick={onViewProfile}>
                        <div className="relative mr-3">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            {user.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {user.name}
                            </h3>
                            <p className="text-sm text-green-500">
                                {user.online ? "Trực tuyến" : "Ngoại tuyến"}
                            </p>
                        </div>
                    </button>

                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={onAudioCall}>
                            <Phone className="h-5 w-5" />
                        </Button>
                        <VideoCallButton contactName={user.name} currentUserName="Admin User" />
                        <Button variant="ghost" size="icon" onClick={onToggleDetails}>
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}