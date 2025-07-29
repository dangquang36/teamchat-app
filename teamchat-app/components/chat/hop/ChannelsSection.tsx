"use client";

import { useState } from "react";
import { Plus, Video, Link } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MeetingModal } from '@/components/modals/hop/MeetingModal';
import { JoinMeetingModal } from '@/components/modals/hop/JoinMeetingModal';

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
    const [searchQuery, setSearchQuery] = useState("");
    const [showJoinSuccess, setShowJoinSuccess] = useState(false);
    const [showCreateSuccess, setShowCreateSuccess] = useState(false);
    const router = useRouter();

    // Modal states
    const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
    const [isJoinMeetingModalOpen, setIsJoinMeetingModalOpen] = useState(false);
    const [isRecentMeetingsModalOpen, setIsRecentMeetingsModalOpen] = useState(false);
    const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);

    // Meeting states
    const [currentMeetingTitle, setCurrentMeetingTitle] = useState("");
    const [currentMeetingId, setCurrentMeetingId] = useState("");
    const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);

    // Handle creating new meeting (starts video call immediately)
    const handleCreateMeeting = () => {
        setIsCreateMeetingModalOpen(true);
    };

    // Handle starting video call from create meeting modal
    const handleStartVideoCall = (title: string, customRoomName?: string) => {
        let roomName: string;

        if (customRoomName) {
            // Sử dụng room name tùy chỉnh
            roomName = customRoomName;
        } else {
            // Tạo room name từ title và random string (fallback)
            roomName = `hop-${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
        }

        // Đóng modal
        setIsCreateMeetingModalOpen(false);

        // Điều hướng đến trang họp của LiveKit
        router.push(`/dashboard/meeting/${roomName}`);

        // Thêm vào recent meetings
        const newMeeting: Meeting = {
            id: Date.now().toString(),
            title: title,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('vi-VN'),
            participants: 1,
            status: 'live',
            meetingId: roomName,
            roomName: roomName,
            description: `Cuộc họp được tạo lúc ${new Date().toLocaleTimeString('vi-VN')}`
        };

        setRecentMeetings(prev => [newMeeting, ...prev]);
    };

    // Handle ending video call
    const handleEndCall = (duration: number) => {
        // Add the completed meeting to recent meetings
        const newMeeting: Meeting = {
            id: Date.now().toString(),
            title: currentMeetingTitle,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('vi-VN'),
            participants: 1, // Just the creator for now
            status: 'ended',
            meetingId: currentMeetingId,
            description: `Cuộc họp kéo dài ${Math.floor(duration / 60)} phút ${duration % 60} giây`
        };

        setRecentMeetings(prev => [newMeeting, ...prev]);
        setIsVideoCallModalOpen(false);
    };

    // Handle showing recent meetings (+ button)
    const handleShowRecentMeetings = () => {
        setIsRecentMeetingsModalOpen(true);
    };

    // Handle joining existing meeting
    const handleJoinMeeting = (meeting: Meeting) => {
        const roomName = meeting.roomName || meeting.meetingId;
        router.push(`/dashboard/meeting/${roomName}`);
    };

    // Handle joining room by ID using modal
    const handleJoinById = () => {
        setIsJoinMeetingModalOpen(true);
    };

    // Handle joining room from modal
    const handleJoinRoom = (roomId: string) => {
        // Thêm vào recent meetings
        const joinedMeeting: Meeting = {
            id: Date.now().toString(),
            title: `Cuộc họp: ${roomId}`,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('vi-VN'),
            participants: 1,
            status: 'live',
            meetingId: roomId,
            roomName: roomId,
            description: `Tham gia lúc ${new Date().toLocaleTimeString('vi-VN')}`
        };

        setRecentMeetings(prev => [joinedMeeting, ...prev]);

        // Navigate to meeting room
        router.push(`/dashboard/meeting/${roomId}`);

        // Show success message
        setShowJoinSuccess(true);
        setTimeout(() => setShowJoinSuccess(false), 3000);
    };

    return (
        <>
            <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 overflow-y-auto">
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
                            Tạo cuộc họp với tên tùy chỉnh hoặc tham gia bằng ID để bắt đầu kết nối với đội ngũ của bạn
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

            {/* Create Meeting Modal - With custom room name support */}
            <MeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => setIsCreateMeetingModalOpen(false)}
                onStartCall={handleStartVideoCall}
            />

            {/* Join Meeting Modal */}
            <JoinMeetingModal
                isOpen={isJoinMeetingModalOpen}
                onClose={() => setIsJoinMeetingModalOpen(false)}
                onJoinRoom={handleJoinRoom}
            />
        </>
    );
}