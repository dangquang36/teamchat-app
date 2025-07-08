'use client';

import React, { useState, useEffect } from 'react';
import { VideoCallRoom } from './VideoCallRoom';
import { Video } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VideoCallButtonProps {
    contactName: string;
    currentUserName: string;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
    contactName,
    currentUserName,
}) => {
    const [isInCall, setIsInCall] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [showRoomInput, setShowRoomInput] = useState(false);
    const [inputRoomName, setInputRoomName] = useState('');
    const [actualUserName, setActualUserName] = useState(currentUserName);

    // Lấy user name thực từ localStorage hoặc profile
    useEffect(() => {
        const savedUserName = localStorage.getItem('currentUserName');
        const userToken = localStorage.getItem('userToken');

        // Kiểm tra xem có thông tin user trong localStorage không
        if (savedUserName) {
            setActualUserName(savedUserName);
        } else if (userToken) {
            // Nếu có token, có thể decode để lấy user info
            try {
                const userInfo = JSON.parse(userToken);
                setActualUserName(userInfo.name || currentUserName);
            } catch {
                setActualUserName(currentUserName);
            }
        }

        console.log('🔍 Current user detected:', actualUserName);
    }, [currentUserName]);

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

        console.log('🚀 Joining room:', inputRoomName, 'as:', actualUserName);
    };

    const createNewRoom = () => {
        const timestamp = Date.now();
        const newRoomName = `call-${actualUserName.toLowerCase().replace(/\s/g, '')}-${timestamp}`;
        setRoomName(newRoomName);
        setIsInCall(true);
        setShowRoomInput(false);

        console.log('🚀 Creating new room:', newRoomName, 'as:', actualUserName);

        // Copy room name to clipboard
        navigator.clipboard.writeText(newRoomName).then(() => {
            console.log('📋 Room name copied to clipboard');
        });
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
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Tham gia Video Call</h3>
                        <button
                            onClick={() => setShowRoomInput(false)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-blue-600 mb-2">Bạn đang đăng nhập: <strong>{actualUserName}</strong></p>
                        <label className="block text-sm font-medium mb-2">
                            Tên Room (để gọi cùng người khác):
                        </label>
                        <input
                            type="text"
                            value={inputRoomName}
                            onChange={(e) => setInputRoomName(e.target.value)}
                            placeholder="Nhập tên room để tham gia..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    joinRoom();
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={joinRoom}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!inputRoomName.trim()}
                        >
                            🔗 Tham gia Room
                        </Button>

                        <div className="flex items-center my-3">
                            <div className="flex-1 border-t border-gray-300"></div>
                            <span className="px-3 text-gray-500 text-sm">hoặc</span>
                            <div className="flex-1 border-t border-gray-300"></div>
                        </div>

                        <Button
                            onClick={createNewRoom}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            ➕ Tạo Room mới
                        </Button>
                    </div>

                    <Button
                        onClick={() => setShowRoomInput(false)}
                        variant="outline"
                        className="w-full mt-4"
                    >
                        Hủy
                    </Button>
                </div>
            </div>
        );
    }

    // Video call interface
    if (isInCall) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold">Video Call với {contactName}</h2>
                            <p className="text-sm text-blue-600">Bạn: {actualUserName}</p>
                            <div className="flex items-center space-x-2 mt-2">
                                <p className="text-sm text-gray-600">Room: </p>
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{roomName}</code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(roomName);
                                        alert('Room name đã được copy!');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                    title="Copy room name"
                                >
                                    📋
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={endCall}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <VideoCallRoom
                        roomName={roomName}
                        participantName={actualUserName}  // Sử dụng actualUserName
                        onLeave={endCall}
                    />
                </div>
            </div>
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={startCall}
            title="Gọi video LiveKit"
        >
            <Video className="h-5 w-5" />
        </Button>
    );
};