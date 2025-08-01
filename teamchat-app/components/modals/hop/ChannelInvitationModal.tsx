'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ChannelInvitation } from '@/contexts/ChannelContext';
import { Check, X, Users, MessageCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChannelInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    invitation: ChannelInvitation;
}

export function ChannelInvitationModal({ isOpen, onClose, invitation }: ChannelInvitationModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { acceptChannelInvitation, declineChannelInvitation } = useChannels();
    const currentUser = useCurrentUser();
    const router = useRouter();

    const handleAccept = async () => {
        if (!currentUser) return;

        setIsProcessing(true);
        try {
            // Chỉ truyền avatar nếu nó có giá trị thật và không phải string rỗng
            const userAvatar = currentUser?.avatar && currentUser.avatar.trim() !== ''
                ? currentUser.avatar
                : undefined;

            console.log('🔍 ChannelInvitationModal - Current user data for invitation accept:', {
                id: currentUser?.id,
                name: currentUser?.name,
                avatar: userAvatar,
                originalAvatar: currentUser?.avatar
            });

            const result = await acceptChannelInvitation(
                invitation.id,
                invitation.channelId,
                currentUser.id,
                currentUser.name,
                userAvatar
            );

            if (result.success) {
                toast({
                    title: "Thành công!",
                    description: `Bạn đã tham gia kênh "${invitation.channelName}"`,
                });
                onClose();
                // Redirect to channel page
                router.push(`/dashboard/kenh/${invitation.channelId}`);
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể tham gia kênh",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tham gia kênh",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDecline = async () => {
        setIsProcessing(true);
        try {
            const result = await declineChannelInvitation(invitation.id);

            if (result.success) {
                toast({
                    title: "Đã từ chối",
                    description: `Bạn đã từ chối lời mời tham gia kênh "${invitation.channelName}"`,
                });
                onClose();
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể từ chối lời mời",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi từ chối lời mời",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={invitation.inviterAvatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 text-lg">
                                    {getInitials(invitation.inviterName)}
                                </AvatarFallback>
                            </Avatar>
                            <Badge className="absolute -bottom-1 -right-1 bg-green-500">
                                <Users className="h-3 w-3" />
                            </Badge>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Lời mời tham gia kênh
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {invitation.inviterName} đã mời bạn tham gia
                    </p>
                </CardHeader>

                {/* Content */}
                <CardContent className="space-y-4">
                    {/* Channel Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <MessageCircle className="h-5 w-5 text-blue-600" />
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                                    {invitation.channelName}
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Kênh chat mới
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Invitation Details */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Người mời:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {invitation.inviterName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Thời gian:</span>
                            <span className="text-gray-900 dark:text-white">
                                {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleDecline}
                            disabled={isProcessing}
                            variant="outline"
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <X className="h-4 w-4 mr-2" />
                            )}
                            Từ chối
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Chấp nhận
                        </Button>
                    </div>
                </CardContent>
            </div>
        </div>
    );
} 