
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Room, RoomOptions } from 'livekit-client';
import MeetingInterface from '@/components/meeting/MeetingInterface';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Copy, Check } from 'lucide-react';

export default function MeetingRoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentUser = useCurrentUser();

    const [room, setRoom] = useState<Room | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roomLink, setRoomLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    const roomName = params.roomName as string;
    const token = searchParams.get('token');
    const wsUrl = searchParams.get('wsUrl');

    useEffect(() => {
        // Tạo link để chia sẻ
        if (typeof window !== 'undefined' && roomName) {
            setRoomLink(`${window.location.origin}/dashboard/meeting/${roomName}`);
        }
    }, [roomName]);

    useEffect(() => {
        if (!currentUser?.id || !roomName) return;

        const connectToRoom = async () => {
            setIsConnecting(true);
            setError(null);

            try {
                let roomToken = token;
                let roomWsUrl = wsUrl;

                // Nếu không có token từ URL, tạo token mới
                if (!roomToken) {
                    console.log('🔑 Creating new token for room:', roomName);
                    const response = await fetch('/api/livekit/join-room', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            roomName,
                            participantName: currentUser.name || 'Người dùng',
                            participantId: currentUser.id,
                            metadata: {
                                avatar: currentUser.avatar,
                                email: currentUser.email
                            }
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Không thể tạo token cho cuộc họp');
                    }

                    const data = await response.json();
                    roomToken = data.token;
                    roomWsUrl = data.wsUrl;
                }

                console.log('🔗 Connecting to LiveKit room:', roomName);

                // Cấu hình room options
                const roomOptions: RoomOptions = {
                    adaptiveStream: true,
                    dynacast: true,
                    videoCaptureDefaults: {
                        resolution: { width: 1280, height: 720 },
                        facingMode: 'user'
                    },
                    audioCaptureDefaults: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    },
                };

                const roomInstance = new Room(roomOptions);
                setRoom(roomInstance);

                // Event listeners
                roomInstance.on('connected', () => {
                    console.log('✅ Connected to LiveKit room:', roomName);
                    setIsConnecting(false);
                });

                roomInstance.on('disconnected', (reason) => {
                    console.log('❌ Disconnected from LiveKit room:', reason);
                    setRoom(null);
                });

                roomInstance.on('reconnecting', () => {
                    console.log('🔄 Reconnecting to LiveKit room...');
                    setIsConnecting(true);
                });

                roomInstance.on('reconnected', () => {
                    console.log('✅ Reconnected to LiveKit room');
                    setIsConnecting(false);
                });

                // Kết nối đến room
                await roomInstance.connect(roomWsUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL!, roomToken!);

            } catch (err) {
                console.error('❌ Error connecting to room:', err);
                setError(err instanceof Error ? err.message : 'Không thể kết nối đến cuộc họp');
                setIsConnecting(false);
            }
        };

        connectToRoom();

        return () => {
            if (room) {
                console.log('🔌 Disconnecting from room...');
                room.disconnect();
            }
        };
    }, [currentUser, roomName, token, wsUrl]);

    const handleLeaveRoom = async () => {
        if (room) {
            await room.disconnect();
        }
        router.push('/dashboard/channels');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(roomLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = roomLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-white">Đang xác thực...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Lỗi kết nối</h2>
                    <p className="text-gray-300 mb-4">{error}</p>

                    {/* Room info */}
                    <div className="mb-6 p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400 mb-2">Phòng họp:</p>
                        <p className="text-white font-mono text-sm break-all">{roomName}</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Thử lại
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard/channels')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isConnecting || !room) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-white">Đang kết nối đến cuộc họp...</p>
                    <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
                </div>
            </div>
        );
    }

    return (
        <MeetingInterface
            room={room}
            onLeaveRoom={handleLeaveRoom}
            roomName={roomName}
            currentUser={currentUser}
        />
    );
}