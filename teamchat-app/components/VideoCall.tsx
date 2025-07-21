'use client';
import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneMissed, Users, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // ✅ 1. Import hook useTheme

interface VideoCallProps {
    roomName: string;
    userName: string;
    onClose: () => void;
}

const dummyParticipants = [
    { id: 1, name: 'Bạn' },
    { id: 2, name: 'Lan' },
    { id: 3, name: 'Quang' },
    { id: 4, name: 'Giap' },
    { id: 5, name: 'Duy' },
    { id: 6, name: 'Son' },
];

export function VideoCall({ roomName, userName, onClose }: VideoCallProps) {
    const { isDarkMode } = useTheme(); // ✅ 2. Lấy trạng thái sáng/tối
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Component nút điều khiển để tái sử dụng
    const ControlButton = ({ onClick, title, isActive, isDestructive = false, children }: any) => (
        <button
            onClick={onClick}
            title={title}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isDestructive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : isActive
                        ? (isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white')
                        : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className={`flex flex-col h-full w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header của cuộc gọi */}
            <header className="p-4 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold">Đang trong cuộc gọi kênh: #{roomName}</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dummyParticipants.length} người tham gia</p>
                </div>
            </header>

            {/* Lưới hiển thị video của mọi người */}
            <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 overflow-y-auto">
                {dummyParticipants.map(p => (
                    <div key={p.id} className={`rounded-lg flex flex-col items-center justify-center relative aspect-video ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {/* Nếu là bạn và video đang tắt */}
                        {p.name === 'Bạn' && isVideoOff ? (
                            <>
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <span className="text-3xl font-bold">{p.name.charAt(0)}</span>
                                </div>
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Camera của bạn đã tắt</p>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <p className="text-2xl font-bold text-white">{p.name}</p>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                            {p.name === 'Bạn' && isMuted && <MicOff className="h-4 w-4 text-red-500 inline mr-1" />}
                            {p.name}
                        </div>
                    </div>
                ))}
            </main>

            {/* Thanh điều khiển ở dưới */}
            <footer className={`p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'}`}>
                <div className="flex justify-center items-center space-x-4">
                    <ControlButton onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Bật mic" : "Tắt mic"} isActive={!isMuted}>
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </ControlButton>

                    <ControlButton onClick={() => setIsVideoOff(!isVideoOff)} title={isVideoOff ? "Bật camera" : "Tắt camera"} isActive={!isVideoOff}>
                        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </ControlButton>

                    <ControlButton onClick={onClose} title="Kết thúc cuộc gọi" isDestructive={true}>
                        <PhoneMissed className="h-6 w-6" />
                    </ControlButton>

                    <ControlButton onClick={() => { }} title="Người tham gia" isActive={true}>
                        <Users className="h-6 w-6" />
                    </ControlButton>

                    <ControlButton onClick={() => { }} title="Cài đặt" isActive={true}>
                        <Settings className="h-6 w-6" />
                    </ControlButton>
                </div>
            </footer>
        </div>
    );
}
