"use client";

import { X, History, Clock, Users } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useTheme } from "@/contexts/ThemeContext";

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

interface MeetingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetings: Meeting[];
    onJoinMeeting: (meeting: Meeting) => void;
}

export function MeetingHistoryModal({ isOpen, onClose, meetings, onJoinMeeting }: MeetingHistoryModalProps) {
    const { isDarkMode } = useTheme();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Lịch sử cuộc họp
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-96">
                    {meetings.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                Chưa có cuộc họp nào được tạo
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {meetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {meeting.title}
                                            </h4>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${meeting.status === 'live'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : meeting.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                                }`}>
                                                {meeting.status === 'live' ? 'Đang live' :
                                                    meeting.status === 'scheduled' ? 'Đã lên lịch' : 'Đã kết thúc'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {meeting.date} {meeting.time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {meeting.participants} người tham gia
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            ID: {meeting.roomName || meeting.meetingId}
                                        </p>
                                    </div>

                                    {meeting.status === 'live' && (
                                        <Button
                                            onClick={() => onJoinMeeting(meeting)}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            Tham gia
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 