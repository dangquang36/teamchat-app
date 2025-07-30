'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Video, Users, Clock, Check, X, Loader2 } from 'lucide-react';

interface MeetingData {
    id: string;
    title: string;
    creatorName: string;
    creatorAvatar?: string;
    channelName: string;
    channelId: string;
    roomName: string;
    createdAt: Date;
}

interface MeetingInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingData: MeetingData | null;
    onAccept?: (meetingData: MeetingData) => void;
    onDecline?: (meetingData: MeetingData) => void;
}

export function MeetingInvitationModal({
    isOpen,
    onClose,
    meetingData,
    onAccept,
    onDecline
}: MeetingInvitationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    if (!isOpen || !meetingData) return null;

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            if (onAccept) {
                await onAccept(meetingData);
            }
            toast({
                title: "Đã tham gia cuộc họp",
                description: `Bạn đã tham gia cuộc họp "${meetingData.title}"`
            });
            onClose();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tham gia cuộc họp",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecline = async () => {
        setIsLoading(true);
        try {
            if (onDecline) {
                await onDecline(meetingData);
            }
            toast({
                title: "Đã từ chối",
                description: `Bạn đã từ chối tham gia cuộc họp "${meetingData.title}"`
            });
            onClose();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể từ chối cuộc họp",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (!dateObj || isNaN(dateObj.getTime())) {
            return 'Không xác định';
        }
        return dateObj.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-0 shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Video className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Lời mời tham gia cuộc họp
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bạn được mời tham gia một cuộc họp mới
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Meeting Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={meetingData.creatorAvatar} />
                                <AvatarFallback className="bg-blue-600 text-white">
                                    {meetingData.creatorName?.charAt(0)?.toUpperCase() || 'M'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {meetingData.creatorName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    đã tạo cuộc họp
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Video className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {meetingData.title}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Kênh: {meetingData.channelName}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Tạo lúc: {formatTime(meetingData.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleAccept}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Tham gia
                        </Button>
                        <Button
                            onClick={handleDecline}
                            disabled={isLoading}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <X className="h-4 w-4 mr-2" />
                            )}
                            Từ chối
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 