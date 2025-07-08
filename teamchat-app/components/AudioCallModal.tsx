// File: components/AudioCallModal.tsx (BẮT BUỘC phải có file này)

'use client';
import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Users } from 'lucide-react';

interface AudioCallModalProps {
    channelName: string;
    onClose: () => void;
    mode: 'outgoing' | 'incoming';
}

const audioParticipants = [
    { id: 1, name: 'Bạn', initial: 'B' },
    { id: 2, name: 'Nicholas S.', initial: 'NS' },
    { id: 3, name: 'Kathryn S.', initial: 'KS' },
];

export function AudioCallModal({ channelName, onClose, mode }: AudioCallModalProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [callStatus, setCallStatus] = useState<'incoming' | 'connecting' | 'ringing' | 'connected'>(mode === 'incoming' ? 'incoming' : 'connecting');
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        if (callStatus === 'connecting') {
            const timer = setTimeout(() => setCallStatus('ringing'), 1500);
            return () => clearTimeout(timer);
        }
        if (callStatus === 'ringing') {
            const timer = setTimeout(() => setCallStatus('connected'), 3000);
            return () => clearTimeout(timer);
        }
    }, [callStatus]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (callStatus === 'connected') {
            timer = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [callStatus]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const getStatusText = () => {
        switch (callStatus) {
            case 'incoming': return 'Cuộc gọi nhóm đến...';
            case 'connecting': return 'Đang kết nối...';
            case 'ringing': return 'Đang đổ chuông...';
            case 'connected': return formatDuration(callDuration);
        }
    };

    const handleAcceptCall = () => {
        setCallStatus('connected');
    };

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">#{channelName}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{getStatusText()}</p>

                <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                    {audioParticipants.map(p => (
                        <div key={p.id} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {p.initial}
                            </div>
                            <span className="text-sm mt-2 text-gray-700 dark:text-gray-300">{p.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center space-x-4">
                    {callStatus === 'incoming' ? (
                        <>
                            <button onClick={onClose} className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center" title="Từ chối">
                                <PhoneOff className="h-7 w-7" />
                            </button>
                            <button onClick={handleAcceptCall} className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center" title="Nghe">
                                <Phone className="h-7 w-7" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'} text-gray-800 dark:text-white`}>
                                {isMuted ? <MicOff /> : <Mic />}
                            </button>
                            <button onClick={onClose} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center">
                                <Phone className="rotate-[135deg]" />
                            </button>
                            <button className="w-14 h-14 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full flex items-center justify-center">
                                <Users />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}