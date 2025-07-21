import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video } from "lucide-react";
import { ChatHeaderProps } from "@/app/types"; // Adjust the import path as needed
import { VideoCallButton } from "../videocall/VideoCallButton";

export function ChatHeader({
    user,
    onVideoCall,
    onAudioCall,
    onViewProfile,
    isDarkMode = false,
}: ChatHeaderProps) {
    return (
        <div
            className={`flex items-center justify-between p-4 border-b transition-colors ${isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
                }`}
        >
            <button className="flex items-center text-left" onClick={onViewProfile}>
                <div className="relative mr-3">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                    />
                    {user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div>
                    <h3
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        {user.name}
                    </h3>
                    <p className="text-sm text-green-500">
                        {user.online ? "Trực tuyến" : "Ngoại tuyến"}
                    </p>
                </div>
            </button>

            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`${isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={onAudioCall}
                >
                    <Phone className="h-5 w-5" />
                </Button>


                {/* Video Call mới (LiveKit) */}
                <VideoCallButton
                    contactName={user.name}
                    currentUserName="Admin User"
                />
            </div>
        </div>
    );
}