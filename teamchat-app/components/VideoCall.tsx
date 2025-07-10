// File: components/VideoCall.tsx (Phiên bản giao diện, không cần API)

'use client';
import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneMissed, Users, Settings } from 'lucide-react';

// Props cho component, thêm onClose để có thể đóng lại từ bên ngoài
interface VideoCallProps {
    roomName: string;
    userName: string;
    onClose: () => void; // Hàm để xử lý khi kết thúc cuộc gọi
}

// Dữ liệu giả lập cho những người tham gia
const dummyParticipants = [
    { id: 1, name: 'Bạn' },
    { id: 2, name: 'Lan' },
    { id: 3, name: 'Quang' },
    { id: 4, name: 'Giap' },
    { id: 5, name: 'Duy' },
    { id: 6, name: 'Son' },
];

export function VideoCall({ roomName, userName, onClose }: VideoCallProps) {
    // State để quản lý trạng thái của các nút bấm
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-white">
            {/* Header của cuộc gọi */}
            <header className="p-4 flex justify-between items-center">
                <div>
                    <h2 className="font-semibold">Đang trong cuộc gọi kênh: #{roomName}</h2>
                    <p className="text-sm text-gray-400">{dummyParticipants.length} người tham gia</p>
                </div>
            </header>

            {/* Lưới hiển thị video của mọi người */}
            <main className="flex-1 grid grid-cols-2 gap-4 p-4">
                {dummyParticipants.map(p => (
                    <div key={p.id} className="bg-gray-800 rounded-lg flex flex-col items-center justify-center relative">
                        {/* Nếu là bạn và video đang tắt */}
                        {p.name === 'Bạn' && isVideoOff ? (
                            <>
                                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold">{p.name.charAt(0)}</span>
                                </div>
                                <p className="text-gray-400">Camera của bạn đã tắt</p>
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <p className="text-2xl font-bold">{p.name}</p>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                            {p.name === 'Bạn' && isMuted && <MicOff className="h-4 w-4 text-red-500" />}
                            {p.name}
                        </div>
                    </div>
                ))}
            </main>

            {/* Thanh điều khiển ở dưới */}
            <footer className="bg-gray-800/50 p-4">
                <div className="flex justify-center items-center space-x-4">
                    {/* Nút tắt/bật mic */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </button>

                    {/* Nút tắt/bật camera */}
                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </button>

                    {/* Nút kết thúc cuộc gọi */}
                    <button
                        onClick={onClose} // Gọi hàm onClose khi bấm nút này
                        className="w-16 h-14 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                        <PhoneMissed className="h-6 w-6" />
                    </button>

                    <button className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-600 hover:bg-gray-700">
                        <Users className="h-6 w-6" />
                    </button>

                    <button className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-600 hover:bg-gray-700">
                        <Settings className="h-6 w-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
}