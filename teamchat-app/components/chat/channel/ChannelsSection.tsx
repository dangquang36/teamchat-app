"use client";

import { useState } from "react";
import { Plus, Video, Link, History, MessageSquare, X, Clock, Users } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { MeetingModal } from '@/components/modals/hop/MeetingModal';
import { JoinMeetingModal } from '@/components/modals/hop/JoinMeetingModal';
import { CreateChannelModal } from '@/components/modals/hop/CreateChannelModal';
import { useChannels } from '@/contexts/ChannelContext';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { PendingInvitationsModal } from '@/components/modals/hop/PendingInvitationsModal';
import { FeaturesModal } from '@/components/modals/hop/FeaturesModal';
import { MeetingHistoryModal } from '@/components/modals/hop/MeetingHistoryModal';

interface Meeting {
    id: string;
    title: string;
    time: string;
    date: string;
    participants: number;
    status: 'scheduled' | 'live' | 'ended';
    meetingId: string;
    description?: string;
    roomName?: string;
}

interface ChannelsSectionProps {
    onCreatePost?: () => void;
}

export function ChannelsSection({ onCreatePost }: ChannelsSectionProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { channels } = useChannels();

    // Modal states
    const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
    const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
    const [isJoinMeetingModalOpen, setIsJoinMeetingModalOpen] = useState(false);
    const [isMeetingHistoryModalOpen, setIsMeetingHistoryModalOpen] = useState(false);
    const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
    const [isPendingInvitationsModalOpen, setIsPendingInvitationsModalOpen] = useState(false);

    // Meeting states
    const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
    const [showJoinSuccess, setShowJoinSuccess] = useState(false);

    // Meeting handlers
    const handleCreateMeeting = () => {
        setIsCreateMeetingModalOpen(true);
    };

    const handleStartVideoCall = (title: string, customRoomName?: string) => {
        const roomId = customRoomName || `room_${Date.now()}`;
        const meeting: Meeting = {
            id: `meeting_${Date.now()}`,
            title,
            time: new Date().toLocaleTimeString('vi-VN'),
            date: new Date().toLocaleDateString('vi-VN'),
            participants: 1,
            status: 'live',
            meetingId: roomId,
            roomName: roomId,
            description: `Tạo lúc ${new Date().toLocaleTimeString('vi-VN')}`
        };

        setRecentMeetings(prev => [meeting, ...prev]);

        // Navigate to meeting room
        router.push(`/dashboard/meeting/${roomId}?title=${encodeURIComponent(title)}`);
    };

    const handleEndCall = (duration: number) => {
        toast({
            title: "Cuộc họp đã kết thúc",
            description: `Thời gian: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        });
    };

    const handleShowRecentMeetings = () => {
        setIsMeetingHistoryModalOpen(true);
    };

    const handleJoinMeeting = (meeting: Meeting) => {
        router.push(`/dashboard/meeting/${meeting.roomName || meeting.meetingId}?title=${encodeURIComponent(meeting.title)}`);
    };

    const handleJoinById = () => {
        setIsJoinMeetingModalOpen(true);
    };

    const handleJoinRoom = (roomId: string) => {
        const joinedMeeting: Meeting = {
            id: `joined_${Date.now()}`,
            title: `Tham gia cuộc họp`,
            time: new Date().toLocaleTimeString('vi-VN'),
            date: new Date().toLocaleDateString('vi-VN'),
            participants: 1,
            status: 'live',
            meetingId: roomId,
            roomName: roomId,
            description: `Tham gia lúc ${new Date().toLocaleTimeString('vi-VN')}`
        };

        setRecentMeetings(prev => [joinedMeeting, ...prev]);
        setShowJoinSuccess(true);
        setTimeout(() => setShowJoinSuccess(false), 3000);
    };

    return (
        <>
            <div className="h-full flex bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 overflow-y-auto">
                {/* Channel Sidebar - Show if there are channels */}
                {channels.length > 0 && <ChannelSidebar />}

                {/* Main Content */}
                <div className="flex-1">
                    {/* Plus button and notification bell in top right corner */}
                    <div className="absolute top-6 right-6 z-10 flex items-center space-x-3">
                        <NotificationBell
                            onClick={() => setIsPendingInvitationsModalOpen(true)}
                        />
                        <button
                            onClick={() => setIsFeaturesModalOpen(true)}
                            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
                            title="Thêm tính năng"
                        >
                            <Plus className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <div className="max-w-7xl mx-auto p-6">
                        <div className="text-center py-16">
                            <div className="relative mb-8">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                                    <Video className="h-16 w-16 text-blue-500 relative z-10" />
                                </div>
                                {recentMeetings.length > 0 && (
                                    <button
                                        onClick={handleShowRecentMeetings}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl"
                                        title="Xem cuộc họp gần đây"
                                    >
                                        <Plus className="h-4 w-4 text-white" />
                                    </button>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {recentMeetings.length > 0 ? "Tạo cuộc họp mới" : "Sẵn sàng cho cuộc họp đầu tiên"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                                Tạo cuộc họp với tên tùy chỉnh hoặc tham gia bằng ID chính xác để bắt đầu kết nối
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Button
                                    onClick={handleCreateMeeting}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <Video className="h-5 w-5 mr-2" />
                                    Tạo cuộc họp mới
                                </Button>

                                <Button
                                    onClick={handleJoinById}
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-400 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                                >
                                    <Link className="h-5 w-5 mr-2" />
                                    Tham gia bằng ID
                                </Button>
                            </div>

                            {/* Success messages */}
                            {showJoinSuccess && (
                                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg max-w-md mx-auto">
                                    <p className="text-green-800 dark:text-green-200">
                                        Đã tham gia cuộc họp thành công!
                                    </p>
                                </div>
                            )}

                            {/* Recent Meetings Quick Access */}
                            {recentMeetings.length > 0 && (
                                <div className="mt-12 max-w-2xl mx-auto">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Cuộc họp gần đây
                                    </h4>
                                    <div className="grid gap-3">
                                        {recentMeetings.slice(0, 3).map((meeting) => (
                                            <div
                                                key={meeting.id}
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => handleJoinMeeting(meeting)}
                                            >
                                                <div className="flex-1 text-left">
                                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                                        {meeting.title}
                                                    </h5>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {meeting.roomName || meeting.meetingId} • {meeting.date} {meeting.time}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${meeting.status === 'live'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}>
                                                    {meeting.status === 'live' ? 'Đang live' : 'Đã kết thúc'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => setIsCreateMeetingModalOpen(false)}
                onStartCall={handleStartVideoCall}
            />

            <JoinMeetingModal
                isOpen={isJoinMeetingModalOpen}
                onClose={() => setIsJoinMeetingModalOpen(false)}
                onJoinRoom={handleJoinRoom}
            />

            <FeaturesModal
                isOpen={isFeaturesModalOpen}
                onClose={() => setIsFeaturesModalOpen(false)}
                onOpenHistory={() => setIsMeetingHistoryModalOpen(true)}
                onCreateChannel={() => setIsCreateChannelModalOpen(true)}
            />

            <MeetingHistoryModal
                isOpen={isMeetingHistoryModalOpen}
                onClose={() => setIsMeetingHistoryModalOpen(false)}
                meetings={recentMeetings}
                onJoinMeeting={handleJoinMeeting}
            />

            <CreateChannelModal
                isOpen={isCreateChannelModalOpen}
                onClose={() => setIsCreateChannelModalOpen(false)}
            />

            <PendingInvitationsModal
                isOpen={isPendingInvitationsModalOpen}
                onClose={() => setIsPendingInvitationsModalOpen(false)}
            />
        </>
    );
}