"use client";

import { useState } from "react";
import {
    X,
    Video,
    Calendar,
    Clock,
    Users,
    Copy,
    MoreVertical,
    UserPlus,
    Camera,
    Info,
    Edit,
    Trash2
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Meeting {
    id: string;
    title: string;
    time: string;
    date: string;
    participants: number;
    status: 'scheduled' | 'live' | 'ended';
    meetingId: string;
    description?: string;
}

interface RecentMeetingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetings: Meeting[];
    onJoinMeeting?: (meeting: Meeting) => void;
}

export function RecentMeetingsModal({
    isOpen,
    onClose,
    meetings,
    onJoinMeeting
}: RecentMeetingsModalProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [showMeetingOptions, setShowMeetingOptions] = useState<string | null>(null);

    const handleMeetingAction = (action: string, meeting: Meeting) => {
        setShowMeetingOptions(null);
        switch (action) {
            case 'addParticipants':
                console.log('Thêm người vào cuộc họp:', meeting.id);
                break;
            case 'changeAvatar':
                console.log('Đổi ảnh cuộc họp:', meeting.id);
                break;
            case 'viewInfo':
                setSelectedMeeting(meeting);
                break;
            case 'edit':
                console.log('Chỉnh sửa cuộc họp:', meeting.id);
                break;
            case 'delete':
                console.log('Xóa cuộc họp:', meeting.id);
                break;
        }
    };

    const copyMeetingId = (meetingId: string) => {
        navigator.clipboard.writeText(meetingId);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleJoinMeeting = (meeting: Meeting) => {
        onJoinMeeting?.(meeting);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Video className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cuộc họp gần đây</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-full w-8 h-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <Alert className="m-4 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                        <Video className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            Mã cuộc họp đã được sao chép vào clipboard!
                        </AlertDescription>
                    </Alert>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {meetings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <Video className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Chưa có cuộc họp nào được tạo
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {meetings.map((meeting) => (
                                <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                                                    <Video className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {meeting.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {meeting.date}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {meeting.time}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="h-4 w-4 mr-1" />
                                                            {meeting.participants} người
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    onClick={() => handleJoinMeeting(meeting)}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Video className="h-4 w-4 mr-1" />
                                                    Tham gia
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyMeetingId(meeting.meetingId)}
                                                >
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    {meeting.meetingId}
                                                </Button>

                                                <div className="relative">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowMeetingOptions(
                                                            showMeetingOptions === meeting.id ? null : meeting.id
                                                        )}
                                                        className="p-2"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>

                                                    {showMeetingOptions === meeting.id && (
                                                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                                                            <div className="py-1">
                                                                <button
                                                                    onClick={() => handleMeetingAction('addParticipants', meeting)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                                >
                                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                                    Thêm người vào cuộc họp
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMeetingAction('changeAvatar', meeting)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                                >
                                                                    <Camera className="h-4 w-4 mr-2" />
                                                                    Đổi ảnh cuộc họp
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMeetingAction('viewInfo', meeting)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                                >
                                                                    <Info className="h-4 w-4 mr-2" />
                                                                    Thông tin cuộc họp
                                                                </button>
                                                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                                                <button
                                                                    onClick={() => handleMeetingAction('edit', meeting)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Chỉnh sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMeetingAction('delete', meeting)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Xóa cuộc họp
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Meeting Detail Modal */}
                {selectedMeeting && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Thông tin cuộc họp
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedMeeting(null)}
                                        className="rounded-full w-8 h-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên cuộc họp</label>
                                        <p className="text-gray-900 dark:text-white">{selectedMeeting.title}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày</label>
                                            <p className="text-gray-900 dark:text-white">{selectedMeeting.date}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giờ</label>
                                            <p className="text-gray-900 dark:text-white">{selectedMeeting.time}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã cuộc họp</label>
                                        <p className="text-gray-900 dark:text-white font-mono">{selectedMeeting.meetingId}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Số người tham gia</label>
                                        <p className="text-gray-900 dark:text-white">{selectedMeeting.participants} người</p>
                                    </div>
                                    {selectedMeeting.description && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Mô tả</label>
                                            <p className="text-gray-900 dark:text-white">{selectedMeeting.description}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 mt-6">
                                    <Button variant="outline" onClick={() => setSelectedMeeting(null)}>
                                        Đóng
                                    </Button>
                                    <Button onClick={() => copyMeetingId(selectedMeeting.meetingId)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Sao chép ID
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}