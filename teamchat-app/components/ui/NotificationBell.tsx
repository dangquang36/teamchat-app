"use client";

import { Bell, Loader2 } from "lucide-react";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

interface NotificationBellProps {
    className?: string;
    onClick?: () => void;
}

export function NotificationBell({ className = "", onClick }: NotificationBellProps) {
    const { invitationCount, hasNewInvitations, clearNewInvitationFlag, isLoading } = useRealTimeUpdates();

    const handleClick = () => {
        clearNewInvitationFlag();
        onClick?.();
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={handleClick}
                className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                title="Thông báo lời mời"
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                    <Bell className={`h-6 w-6 text-white group-hover:animate-bounce transition-transform duration-300 ${hasNewInvitations ? 'animate-pulse' : ''}`} />
                )}
            </button>

            {/* Notification badge */}
            {invitationCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">
                        {invitationCount > 9 ? '9+' : invitationCount}
                    </span>
                </div>
            )}
        </div>
    );
} 