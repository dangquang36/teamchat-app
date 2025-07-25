'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { FriendRequestList } from './FriendRequestList';
import { UserPlus } from 'lucide-react';

interface FriendRequestSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onFriendRequestAccepted: (requesterId: string) => void;
    onShowToast: (message: string) => void;
    isDarkMode?: boolean;
}

export function FriendRequestSheet({
    isOpen,
    onClose,
    onFriendRequestAccepted,
    onShowToast,
    isDarkMode = false
}: FriendRequestSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="left"
                className={`w-[350px] sm:w-[400px] p-0 transition-colors duration-300 ${isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
            >
                <SheetHeader className={`p-6 pb-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <SheetTitle className={`flex items-center gap-2 text-xl transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        <UserPlus className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-purple-600'}`} />
                        Lời Mời Kết Bạn
                    </SheetTitle>
                    <SheetDescription className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Chấp nhận hoặc từ chối các lời mời đang chờ.
                    </SheetDescription>
                </SheetHeader>
                <div className={`py-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    <FriendRequestList
                        onFriendRequestAccepted={onFriendRequestAccepted}
                        onShowToast={onShowToast}
                        isDarkMode={isDarkMode}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}