'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Room,
    LocalParticipant,
    RemoteParticipant,
    DataPacket_Kind,
    Track,
    RoomEvent,
} from 'livekit-client';
import {
    MessageCircle,
    Users,
    Maximize,
    Minimize,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ParticipantVideo from '@/components/meeting/ParticipantVideo';
import MeetingControls from '@/components/meeting/MeetingControls';
import MeetingChat from '@/components/meeting/MeetingChat';
import ParticipantsList from '@/components/meeting/ParticipantsList';

export interface ChatMessage {
    id: string;
    participantId: string;
    participantName: string;
    message: string;
    timestamp: number;
}

interface MeetingInterfaceProps {
    room: Room;
    onLeaveRoom: () => void;
    roomName: string;
    currentUser: any;
}

export default function MeetingInterface({
    room,
    onLeaveRoom,
    roomName,
    currentUser,
}: MeetingInterfaceProps) {
    const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [meetingDuration, setMeetingDuration] = useState(0);

    const meetingContainerRef = useRef<HTMLDivElement>(null);
    const startTime = useRef(Date.now());
    const { toast } = useToast();

    useEffect(() => {
        const interval = setInterval(() => {
            setMeetingDuration(Math.floor((Date.now() - startTime.current) / 1000));
        },);
        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!room) return;

        const onConnected = () => {
            setLocalParticipant(room.localParticipant);
            setRemoteParticipants(Array.from(room.remoteParticipants.values()));

            // Đồng bộ state với trạng thái thực tế của room
            const actualMicState = room.localParticipant.isMicrophoneEnabled;
            const actualCameraState = room.localParticipant.isCameraEnabled;
            const actualScreenShareState = room.localParticipant.isScreenShareEnabled;

            setIsMicEnabled(actualMicState);
            setIsCameraEnabled(actualCameraState);
            setIsScreenSharing(actualScreenShareState);
        };

        const onParticipantConnected = (participant: RemoteParticipant) => setRemoteParticipants(prev => [...prev, participant]);
        const onParticipantDisconnected = (participant: RemoteParticipant) => setRemoteParticipants(prev => prev.filter(p => p.sid !== participant.sid));

        const onTrackUpdated = () => {
            setRemoteParticipants(Array.from(room.remoteParticipants.values()));
            if (room.localParticipant) {
                // Đồng bộ state với trạng thái thực tế
                const actualScreenShareState = room.localParticipant.isScreenShareEnabled;
                const actualCameraState = room.localParticipant.isCameraEnabled;
                const actualMicState = room.localParticipant.isMicrophoneEnabled;

                setIsScreenSharing(actualScreenShareState);
                setIsCameraEnabled(actualCameraState);
                setIsMicEnabled(actualMicState);
            }
        };

        const onLocalTrackPublished = (publication: any) => { if (publication.source === Track.Source.ScreenShare) setIsScreenSharing(true); };
        const onLocalTrackUnpublished = (publication: any) => { if (publication.source === Track.Source.ScreenShare) setIsScreenSharing(false); };

        room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
        room.on(RoomEvent.TrackPublished, onTrackUpdated);
        room.on(RoomEvent.TrackUnpublished, onTrackUpdated);
        if (room.localParticipant) {
            room.localParticipant.on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
            room.localParticipant.on(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
        }
        if (room.state === 'connected') onConnected();
        else room.once(RoomEvent.Connected, onConnected);

        return () => {
            room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
            room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
            room.off(RoomEvent.TrackPublished, onTrackUpdated);
            room.off(RoomEvent.TrackUnpublished, onTrackUpdated);
            if (room.localParticipant) {
                room.localParticipant.off(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
                room.localParticipant.off(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
            }
        };
    }, [room]);

    const toggleMicrophone = async () => {
        if (!localParticipant) return;
        const newMicState = !isMicEnabled;
        await localParticipant.setMicrophoneEnabled(newMicState);
        setIsMicEnabled(newMicState);
        toast({ title: newMicState ? "Đã bật micro" : "Đã tắt micro" });
    };

    const toggleCamera = async () => {
        if (!localParticipant) return;

        try {
            const newCameraState = !isCameraEnabled;

            // Cập nhật state trước để UI phản hồi ngay lập tức
            setIsCameraEnabled(newCameraState);

            // Thực hiện thay đổi camera với timeout để tránh treo
            const cameraPromise = localParticipant.setCameraEnabled(newCameraState);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Camera timeout')), 5000)
            );

            await Promise.race([cameraPromise, timeoutPromise]);

            // Verify camera state sau khi thay đổi
            const actualCameraState = localParticipant.isCameraEnabled;
            if (actualCameraState !== newCameraState) {
                setIsCameraEnabled(actualCameraState);
            }

            toast({
                title: newCameraState ? "Đã bật camera" : "Đã tắt camera",
                description: actualCameraState !== newCameraState ? "Camera có thể cần thời gian để khởi động" : undefined
            });
        } catch (error) {
            console.error("Lỗi khi thay đổi camera:", error);
            // Revert state nếu có lỗi
            setIsCameraEnabled(localParticipant.isCameraEnabled);
            toast({
                title: "Lỗi khi thay đổi camera",
                variant: "destructive",
                description: "Vui lòng thử lại sau"
            });
        }
    };

    const toggleScreenShare = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setScreenShareEnabled(!isScreenSharing, { audio: true });
        } catch (error) {
            console.error("Lỗi chia sẻ màn hình:", error);
            toast({ title: "Lỗi khi chia sẻ màn hình", variant: "destructive" });
        }
    };

    const sendChatMessage = async () => {
        if (!newMessage.trim() || !room) return;
        try {
            const message = { type: 'chat', text: newMessage.trim() };
            const data = new TextEncoder().encode(JSON.stringify(message));
            await room.localParticipant.publishData(data, { reliable: true });
            const chatMessage: ChatMessage = {
                id: Date.now().toString(),
                participantId: currentUser.id,
                participantName: currentUser.name || 'Bạn',
                message: newMessage.trim(),
                timestamp: Date.now()
            };
            setChatMessages(prev => [...prev, chatMessage]);
            setNewMessage('');
        } catch (error) {
            toast({ title: "Lỗi gửi tin nhắn", variant: "destructive" });
        }
    };

    const toggleFullscreen = () => {
        if (!meetingContainerRef.current) return;
        if (!isFullscreen) {
            meetingContainerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const handleChatToggle = () => {
        if (showParticipants) setShowParticipants(false);
        setShowChat(!showChat);
        if (!showChat) setUnreadMessages(0);
    };

    const handleParticipantsToggle = () => {
        if (showChat) setShowChat(false);
        setShowParticipants(!showParticipants);
    };

    const allParticipants = [localParticipant, ...remoteParticipants].filter(p => p !== null) as (LocalParticipant | RemoteParticipant)[];
    const screenShareParticipant = allParticipants.find(p => p.isScreenShareEnabled);
    const galleryParticipants = allParticipants.filter(p => p.sid !== screenShareParticipant?.sid);
    const isAlone = allParticipants.length === 1;
    const totalParticipants = allParticipants.length;

    return (
        <div
            ref={meetingContainerRef}
            className="h-screen w-full bg-slate-900 flex flex-col overflow-hidden"
        >
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 px-6 py-3 z-20 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-white font-bold text-lg truncate">
                            {roomName.replace(/^room-/, '').replace(/-/g, ' ')}
                        </h1>
                        <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-none">
                                <Users className="h-3 w-3 mr-1.5" />
                                {totalParticipants}
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-none">
                                <Clock className="h-3 w-3 mr-1.5" />
                                {formatDuration(meetingDuration)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-gray-300 hover:text-white h-9 w-9">
                            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleParticipantsToggle} className={`text-gray-300 hover:text-white h-9 w-9 ${showParticipants ? 'bg-blue-500/20 text-blue-300' : ''}`}>
                            <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleChatToggle} className={`text-gray-300 hover:text-white relative h-9 w-9 ${showChat ? 'bg-blue-500/20 text-blue-300' : ''}`}>
                            <MessageCircle className="h-4 w-4" />
                            {unreadMessages > 0 && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {unreadMessages}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex relative overflow-hidden min-h-0">
                {/* Video Area */}
                <div className={`flex-1 h-full transition-all duration-300 ease-in-out overflow-hidden ${showChat || showParticipants ? 'mr-[320px]' : 'mr-0'}`}>
                    {screenShareParticipant ? (
                        // GIAO DIỆN KHI CHIA SẺ MÀN HÌNH
                        <div className="flex h-full overflow-hidden">
                            {/* Main screen share area */}
                            <div className="flex-1 h-full p-4 overflow-hidden min-w-0">
                                <div className="w-full h-full overflow-hidden rounded-lg">
                                    <ParticipantVideo
                                        key={screenShareParticipant.sid}
                                        participant={screenShareParticipant}
                                        isLocal={screenShareParticipant.isLocal}
                                        participantName={screenShareParticipant.name || 'Người dùng'}
                                    />
                                </div>
                            </div>

                            {/* Participants sidebar */}
                            <div className="w-60 h-full flex-shrink-0 py-4 pr-4 overflow-hidden">
                                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                    <div className="space-y-3">
                                        {galleryParticipants.map((p) => (
                                            <div key={p.sid} className="w-full aspect-video rounded-lg overflow-hidden">
                                                <ParticipantVideo
                                                    participant={p}
                                                    isLocal={p.isLocal}
                                                    participantName={p.name || 'Người dùng'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // GIAO DIỆN KHI KHÔNG CHIA SẺ MÀN HÌNH
                        <div className="h-full p-4 overflow-hidden">
                            {isAlone && localParticipant ? (
                                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full max-w-4xl max-h-[75vh] rounded-lg overflow-hidden">
                                        <ParticipantVideo
                                            participant={localParticipant}
                                            isLocal={true}
                                            participantName={currentUser.name || 'Bạn'}
                                            isMicEnabled={isMicEnabled}
                                            isCameraEnabled={isCameraEnabled}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full auto-rows-min overflow-hidden">
                                    {allParticipants.map((p) => (
                                        <ParticipantVideo
                                            key={p.sid}
                                            participant={p}
                                            isLocal={p.isLocal}
                                            participantName={p.name || 'Người dùng'}
                                            isMicEnabled={p.isLocal ? isMicEnabled : undefined}
                                            isCameraEnabled={p.isLocal ? isCameraEnabled : undefined}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar (Chat/Participants) */}
                <aside className={`absolute right-0 top-0 bottom-0 w-80 bg-slate-800 border-l border-slate-700 transition-transform duration-300 ease-in-out overflow-hidden ${showChat || showParticipants ? 'translate-x-0' : 'translate-x-full'}`}>
                    {showChat && (
                        <MeetingChat
                            messages={chatMessages}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            onSendMessage={sendChatMessage}
                            onClose={() => setShowChat(false)}
                        />
                    )}
                    {showParticipants && (
                        <ParticipantsList
                            localParticipant={localParticipant}
                            remoteParticipants={remoteParticipants}
                            currentUser={currentUser}
                            onClose={() => setShowParticipants(false)}
                        />
                    )}
                </aside>
            </main>

            {/* Footer Controls */}
            <footer className="relative z-20 flex-shrink-0">
                <MeetingControls
                    isMicEnabled={isMicEnabled}
                    isCameraEnabled={isCameraEnabled}
                    isScreenSharing={isScreenSharing}
                    onToggleMic={toggleMicrophone}
                    onToggleCamera={toggleCamera}
                    onToggleScreenShare={toggleScreenShare}
                    onLeaveRoom={onLeaveRoom}
                />
            </footer>
        </div>
    );
}