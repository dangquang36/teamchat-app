"use client";

import { useState } from "react";
import { Users, Check, X, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useChannels } from '@/contexts/ChannelContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/components/ui/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useRouter } from 'next/navigation';

interface PendingInvitationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PendingInvitationsModal({ isOpen, onClose }: PendingInvitationsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { acceptChannelInvitation, declineChannelInvitation } = useChannels();
    const currentUser = useCurrentUser();
    const { toast } = useToast();
    const { pendingInvitations, isLoading: isFetching, refreshInvitations } = useRealTimeUpdates();
    const router = useRouter();

    const handleAccept = async (invitation: any) => {
        setIsLoading(true);
        try {
            const result = await acceptChannelInvitation(
                invitation.id,
                invitation.channelId,
                currentUser?.id || '',
                currentUser?.name || '',
                currentUser?.avatar
            );

            if (result.success) {
                toast({
                    title: "Thành công!",
                    description: `Bạn đã tham gia kênh "${invitation.channelName}"`,
                });
                // Refresh invitations after accepting
                await refreshInvitations();
                // Close modal and redirect to channel
                onClose();
                router.push(`/dashboard/kenh/${invitation.channelId}`);
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể chấp nhận lời mời",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error accepting invitation:', error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi chấp nhận lời mời",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecline = async (invitation: any) => {
        setIsLoading(true);
        try {
            const result = await declineChannelInvitation(invitation.id);

            if (result.success) {
                toast({
                    title: "Đã từ chối",
                    description: `Bạn đã từ chối lời mời tham gia kênh "${invitation.channelName}"`,
                });
                // Refresh invitations after declining
                await refreshInvitations();
            } else {
                toast({
                    title: "Lỗi",
                    description: result.error || "Không thể từ chối lời mời",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error declining invitation:', error);
            toast({
                title: "Lỗi",
                description: "Đã xảy ra lỗi khi từ chối lời mời",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Lời mời tham gia kênh
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {isFetching ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Đang tải...</span>
                    </div>
                ) : pendingInvitations.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Không có lời mời nào đang chờ
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingInvitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {invitation.channelName}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Mời bởi: {invitation.inviterName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {new Date(invitation.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2 ml-4">
                                        <Button
                                            onClick={() => handleAccept(invitation)}
                                            disabled={isLoading}
                                            size="sm"
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleDecline(invitation)}
                                            disabled={isLoading}
                                            size="sm"
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 