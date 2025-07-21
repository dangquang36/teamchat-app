'use client';

import React, { useState, useEffect } from 'react';
import { VideoCallRoom } from './VideoCallRoom';
import { Video, X, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/contexts/ThemeContext';

interface VideoCallButtonProps {
    contactName: string;
    currentUserName: string;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
    contactName,
    currentUserName,
}) => {
    const { isDarkMode } = useTheme();
    const [isInCall, setIsInCall] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [showRoomInput, setShowRoomInput] = useState(false);
    const [inputRoomName, setInputRoomName] = useState('');
    const [actualUserName, setActualUserName] = useState(currentUserName);

    useEffect(() => {
        const savedUserName = localStorage.getItem('currentUserName');
        if (savedUserName) {
            setActualUserName(savedUserName);
        }
    }, []);

    const startCall = () => {
        setShowRoomInput(true);
    };

    const joinRoom = () => {
        if (!inputRoomName.trim()) {
            alert('Vui lòng nhập tên room!');
            return;
        }
        setRoomName(inputRoomName.trim());
        setIsInCall(true);
        setShowRoomInput(false);
    };

    const createNewRoom = () => {
        const newRoomName = `call-${Date.now()}`;
        setRoomName(newRoomName);
        setIsInCall(true);
        setShowRoomInput(false);
        navigator.clipboard.writeText(newRoomName);
    };

    const endCall = () => {
        setIsInCall(false);
        setRoomName('');
        setShowRoomInput(false);
        setInputRoomName('');
    };

    // Modal nhập room name
    if (showRoomInput) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Tham gia Video Call</h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowRoomInput(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mb-4">
                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bạn đang đăng nhập: <strong>{actualUserName}</strong></p>
                        <label className="block text-sm font-medium mb-2">
                            Tên Room (để gọi cùng người khác):
                        </label>
                        <input
                            type="text"
                            value={inputRoomName}
                            onChange={(e) => setInputRoomName(e.target.value)}
                            placeholder="Nhập tên room để tham gia..."
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                        />
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={joinRoom}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={!inputRoomName.trim()}
                        >
                            🔗 Tham gia Room
                        </Button>

                        <div className="flex items-center my-3">
                            <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                            <span className={`px-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>hoặc</span>
                            <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
                        </div>

                        <Button
                            onClick={createNewRoom}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            ➕ Tạo Room mới
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Giao diện cuộc gọi
    if (isInCall) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className={`rounded-lg max-w-6xl w-full mx-4 h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                    <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div>
                            <h2 className="text-xl font-bold">Video Call với {contactName}</h2>
                            <div className="flex items-center space-x-2 mt-2">
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Room: </p>
                                <code className={`px-2 py-1 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{roomName}</code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigator.clipboard.writeText(roomName)}
                                    className="h-7 w-7"
                                    title="Copy room name"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={endCall}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <VideoCallRoom
                            roomName={roomName}
                            participantName={actualUserName}
                            onLeave={endCall}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={startCall}
            title="Gọi video LiveKit"
        >
            <Video className="h-5 w-5" />
        </Button>
    );
};
