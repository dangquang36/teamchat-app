
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
}

export function FriendRequestSheet({
    isOpen,
    onClose,
    onFriendRequestAccepted,
    onShowToast
}: FriendRequestSheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="left" className="w-[350px] sm:w-[400px] bg-gray-800 border-gray-700 text-white p-0">
                <SheetHeader className="p-6 pb-4 border-b border-gray-700">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <UserPlus />
                        Lời Mời Kết Bạn
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Chấp nhận hoặc từ chối các lời mời đang chờ.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <FriendRequestList
                        onFriendRequestAccepted={onFriendRequestAccepted}
                        onShowToast={onShowToast}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}