import { useState, useEffect, useRef } from 'react';
import { Room, RemoteParticipant, LocalParticipant, ConnectionState } from 'livekit-client';
import { Socket } from 'socket.io-client';

export interface CallData {
    callerId: string;
    receiverId: string;
    callerName: string;
    receiverName?: string;
    roomName: string;
    callType: 'audio' | 'video';
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'rejected' | 'ended' | 'connecting' | 'timeout' | 'busy' | 'unavailable';

export const useCall = (socket: Socket | null, currentUserId: string, currentUserName?: string) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
    const [autoEndMessage, setAutoEndMessage] = useState<string | null>(null);
    const [callEndReason, setCallEndReason] = useState<string | null>(null);
    const [callType, setCallType] = useState<'audio' | 'video'>('video');

    // Enhanced user name management
    const [callerName, setCallerName] = useState<string | null>(null);
    const [receiverName, setReceiverName] = useState<string | null>(null);
    const [isInitiator, setIsInitiator] = useState<boolean>(false);

    const roomRef = useRef<Room | null>(null);
    const autoEndTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callStartTimeRef = useRef<number | null>(null);

    // Utility function để lấy tên người dùng từ phía bên kia
    const getRemoteUserName = () => {
        if (isInitiator) {
            // Nếu là người gọi, remote user là người nhận
            return receiverName || 'Người dùng';
        } else {
            // Nếu là người nhận, remote user là người gọi
            return callerName || 'Người dùng';
        }
    };

    // Auto-end timer functions
    const startAutoEndTimer = () => {
        console.log('🕐 Starting auto-end timer (2 minutes)...');
        if (autoEndTimerRef.current) {
            clearTimeout(autoEndTimerRef.current);
        }
        autoEndTimerRef.current = setTimeout(() => {
            console.log('⏰ Auto-ending call after 2 minutes of waiting...');
            setAutoEndMessage('Cuộc gọi đã tự động kết thúc sau 2 phút chờ đợi');
            setCallEndReason('Không có người tham gia trong 2 phút');
            endCall('timeout');
        }, 2 * 60 * 1000);
    };

    const stopAutoEndTimer = () => {
        console.log('🛑 Stopping auto-end timer...');
        if (autoEndTimerRef.current) {
            clearTimeout(autoEndTimerRef.current);
            autoEndTimerRef.current = null;
        }
    };

    const manageAutoEndTimer = (remoteCount: number) => {
        if (remoteCount === 0) {
            if (!autoEndTimerRef.current) {
                startAutoEndTimer();
            }
        } else {
            stopAutoEndTimer();
        }
    };

    // Media permissions request
    const requestMediaPermissions = async (type: 'audio' | 'video'): Promise<boolean> => {
        try {
            console.log(`🎥 Requesting ${type} permissions...`);
            const constraints: MediaStreamConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            if (type === 'video') {
                constraints.video = {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                };
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log(`✅ ${type} permissions granted, stream tracks:`, stream.getTracks().map(t => t.kind));
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error(`❌ Error requesting ${type} permissions:`, error);
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    const mediaType = type === 'video' ? 'camera và microphone' : 'microphone';
                    alert(`Vui lòng cho phép truy cập ${mediaType} để thực hiện cuộc gọi`);
                } else if (error.name === 'NotFoundError') {
                    const mediaType = type === 'video' ? 'camera hoặc microphone' : 'microphone';
                    alert(`Không tìm thấy ${mediaType}`);
                } else if (error.name === 'NotReadableError') {
                    const mediaType = type === 'video' ? 'Camera hoặc microphone' : 'Microphone';
                    alert(`${mediaType} đang được sử dụng bởi ứng dụng khác`);
                }
            }
            return false;
        }
    };

    // Socket event listeners với quản lý tên chính xác
    useEffect(() => {
        if (!socket || !currentUserId) return;

        const handleIncomingCall = (callData: CallData) => {
            console.log('📞 Incoming call from:', callData.callerName, 'Type:', callData.callType);
            setIncomingCall(callData);
            setCallStatus('ringing');
            setCallType(callData.callType);

            // Set names correctly for incoming call
            setCallerName(callData.callerName);
            setReceiverName(currentUserName || 'Bạn');
            setIsInitiator(false); // Đây là người nhận
        };

        const handleCallAccepted = async (callData: CallData) => {
            console.log('✅ Call accepted, connecting to room:', callData.roomName, 'Type:', callData.callType);
            setCallStatus('connected');
            setCallType(callData.callType);

            // Update receiver name when call is accepted
            if (callData.receiverName && isInitiator) {
                setReceiverName(callData.receiverName);
            }
        };

        const handleCallRejected = (data: { reason: string; message: string; callType?: string }) => {
            console.log('❌ Call rejected:', data.message, 'Type:', data.callType);
            setCallStatus('rejected');
            setIncomingCall(null);

            const reasonMessages = {
                busy: 'Người dùng đang bận',
                declined: 'Cuộc gọi bị từ chối',
                unavailable: 'Người dùng không có sẵn'
            };
            setCallEndReason(reasonMessages[data.reason as keyof typeof reasonMessages] || 'Cuộc gọi không thành công');

            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            stopAutoEndTimer();
            resetCallState();

            setTimeout(() => {
                setCallStatus('idle');
                setCallEndReason(null);
            }, 3000);
        };

        const handleCallEnded = (data: any) => {
            console.log('📞 Call ended by:', data.endedBy, 'Type:', data.callType);
            if (data.reason === 'timeout') {
                setCallEndReason('Người dùng đã ngắt kết nối');
            } else if (data.reason === 'disconnect') {
                setCallEndReason('Mất kết nối với người dùng');
            } else {
                setCallEndReason('Cuộc gọi đã kết thúc');
            }
            endCall();
        };

        const handleCallTimeout = () => {
            console.log('⏰ Call timeout received from server');
            setAutoEndMessage('Không có phản hồi từ người nhận');
            setCallEndReason('Không có phản hồi');
            endCall('timeout');
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', handleCallRejected);
        socket.on('callEnded', handleCallEnded);
        socket.on('callTimeout', handleCallTimeout);

        socket.on('callStatusChange', (data: { type: string; message?: string; callType?: string }) => {
            console.log('📡 Call status change:', data);
            if (data.type === 'timeout') {
                setAutoEndMessage(data.message || 'Cuộc gọi đã hết thời gian');
                setCallEndReason('Hết thời gian chờ');
                endCall('timeout');
            }
        });

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callRejected', handleCallRejected);
            socket.off('callEnded', handleCallEnded);
            socket.off('callTimeout', handleCallTimeout);
            socket.off('callStatusChange');
        };
    }, [socket, currentUserId, currentUserName]);

    // Reset call state helper
    const resetCallState = () => {
        setCallerName(null);
        setReceiverName(null);
        setIsInitiator(false);
    };

    // Room events setup
    const setupRoomEvents = (roomInstance: Room) => {
        console.log('🏠 Setting up room events...');

        roomInstance.on('connected', () => {
            console.log('✅ Connected to LiveKit room');
            setConnectionState(ConnectionState.Connected);
            setIsInCall(true);
            setCallStatus('connected');
            callStartTimeRef.current = Date.now();

            setLocalParticipant(roomInstance.localParticipant);
            const remotes = Array.from(roomInstance.remoteParticipants.values());
            setRemoteParticipants(remotes);

            manageAutoEndTimer(remotes.length);

            console.log(`🏠 Room connected. Local: ${roomInstance.localParticipant.identity}, Remotes found: ${roomInstance.numParticipants}`);
        });

        roomInstance.on('disconnected', () => {
            console.log('❌ Disconnected from LiveKit room');
            setConnectionState(ConnectionState.Disconnected);
            setIsInCall(false);
            setLocalParticipant(null);
            setRemoteParticipants([]);
            stopAutoEndTimer();
        });

        roomInstance.on('participantConnected', (participant: RemoteParticipant) => {
            console.log('👤 Participant connected:', participant.identity);
            setRemoteParticipants(prev => {
                const newParticipants = [...prev, participant];
                manageAutoEndTimer(newParticipants.length);
                return newParticipants;
            });
            setCallStatus('connected');
        });

        roomInstance.on('participantDisconnected', (participant: RemoteParticipant) => {
            console.log('👤 Participant disconnected:', participant.identity);
            setRemoteParticipants(prev => {
                const newParticipants = prev.filter(p => p.identity !== participant.identity);
                manageAutoEndTimer(newParticipants.length);
                return newParticipants;
            });

            setCallEndReason('Người dùng đã rời cuộc gọi');
        });

        roomInstance.on('trackSubscribed', (track, publication, participant) => {
            console.log('📡 Track subscribed:', track.kind, 'from', participant.identity);
        });

        roomInstance.on('trackUnsubscribed', (track, publication, participant) => {
            console.log('📡 Track unsubscribed:', track.kind, 'from', participant.identity);
        });
    };

    // Initiate call function với enhanced name management
    const initiateCall = async (
        receiverId: string,
        receiverDisplayName: string,
        callerDisplayName: string,
        type: 'audio' | 'video' = 'video'
    ) => {
        if (!socket || !currentUserId) {
            console.error('❌ Socket not connected or user not available');
            return { success: false, error: 'Connection error' };
        }

        try {
            console.log(`📞 Initiating ${type} call:`, {
                from: callerDisplayName,
                to: receiverDisplayName,
                callerId: currentUserId,
                receiverId: receiverId
            });

            setCallStatus('calling');
            setCallType(type);

            // Set names correctly for outgoing call
            setCallerName(callerDisplayName);
            setReceiverName(receiverDisplayName);
            setIsInitiator(true); // Đây là người gọi

            setAutoEndMessage(null);
            setCallEndReason(null);

            const hasPermissions = await requestMediaPermissions(type);
            if (!hasPermissions) {
                setCallStatus('idle');
                resetCallState();
                return { success: false, error: 'Không thể truy cập media' };
            }

            const response = await fetch('/api/call/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callerId: currentUserId,
                    receiverId,
                    callerName: callerDisplayName,
                    callType: type
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API call failed: ${response.status} ${errorText}`);
            }

            const { roomName, token, wsUrl } = await response.json();
            console.log('✅ API response received:', { roomName, wsUrl: wsUrl ? 'present' : 'missing' });

            const roomInstance = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: type === 'video' ? {
                    resolution: { width: 1280, height: 720 },
                    facingMode: 'user'
                } : undefined,
                audioCaptureDefaults: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            roomRef.current = roomInstance;
            setRoom(roomInstance);

            setupRoomEvents(roomInstance);

            console.log('🔗 Connecting to LiveKit room...');
            setCallStatus('connecting');

            await roomInstance.connect(wsUrl, token);
            console.log('✅ Connected to LiveKit room successfully');

            setLocalParticipant(roomInstance.localParticipant);

            try {
                console.log(`🎥 Enabling ${type} media...`);
                await roomInstance.localParticipant.setMicrophoneEnabled(true);

                if (type === 'video') {
                    await roomInstance.localParticipant.setCameraEnabled(true);
                } else {
                    await roomInstance.localParticipant.setCameraEnabled(false);
                }

                console.log(`✅ ${type} media enabled successfully`);
            } catch (enableError) {
                console.error('❌ Error enabling media:', enableError);
            }

            console.log('📤 Sending call notification via socket...');
            socket.emit('initiateCall', {
                receiverId,
                callData: {
                    callerId: currentUserId,
                    receiverId,
                    callerName: callerDisplayName,
                    receiverName: receiverDisplayName,
                    roomName,
                    callType: type
                }
            });

            console.log(`✅ ${type} call initiated successfully`);
            return { success: true, roomName };

        } catch (error) {
            console.error('❌ Error initiating call:', error);
            setCallStatus('idle');
            resetCallState();
            setCallEndReason('Không thể khởi tạo cuộc gọi');

            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            stopAutoEndTimer();

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initiate call'
            };
        }
    };

    // Accept call function
    const acceptCall = async () => {
        if (!incomingCall || !socket) {
            console.error('❌ No incoming call or socket not connected');
            return { success: false, error: 'No incoming call' };
        }

        try {
            console.log(`✅ Accepting ${incomingCall.callType} call from:`, incomingCall.callerName);
            setCallStatus('connecting');
            setCallType(incomingCall.callType);
            setAutoEndMessage(null);
            setCallEndReason(null);

            const hasPermissions = await requestMediaPermissions(incomingCall.callType);
            if (!hasPermissions) {
                setCallEndReason('Không thể truy cập media');
                rejectCall('unavailable');
                return { success: false, error: 'Không thể truy cập media' };
            }

            const response = await fetch('/api/call/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: currentUserId,
                    roomName: incomingCall.roomName,
                    callerId: incomingCall.callerId,
                    callType: incomingCall.callType
                })
            });

            if (!response.ok) {
                throw new Error('Failed to accept call');
            }

            const { token, wsUrl } = await response.json();

            const roomInstance = new Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: incomingCall.callType === 'video' ? {
                    resolution: { width: 1280, height: 720 },
                    facingMode: 'user'
                } : undefined,
                audioCaptureDefaults: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            roomRef.current = roomInstance;
            setRoom(roomInstance);

            setupRoomEvents(roomInstance);

            await roomInstance.connect(wsUrl, token);
            setLocalParticipant(roomInstance.localParticipant);

            await roomInstance.localParticipant.setMicrophoneEnabled(true);

            if (incomingCall.callType === 'video') {
                await roomInstance.localParticipant.setCameraEnabled(true);
            } else {
                await roomInstance.localParticipant.setCameraEnabled(false);
            }

            socket.emit('acceptCall', {
                callerId: incomingCall.callerId,
                callData: {
                    ...incomingCall,
                    receiverId: currentUserId,
                    receiverName: currentUserName || 'Bạn'
                }
            });

            setIncomingCall(null);
            console.log(`✅ ${incomingCall.callType} call accepted successfully`);
            return { success: true };

        } catch (error) {
            console.error('❌ Error accepting call:', error);
            setCallStatus('idle');
            setIncomingCall(null);
            resetCallState();
            setCallEndReason('Không thể chấp nhận cuộc gọi');

            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            stopAutoEndTimer();
            return { success: false, error: 'Failed to accept call' };
        }
    };

    // Reject call function
    const rejectCall = (reason: 'busy' | 'declined' | 'unavailable' = 'declined') => {
        if (!incomingCall || !socket) return;

        console.log('❌ Rejecting call, reason:', reason, 'Type:', incomingCall.callType);

        const reasonMessages = {
            busy: 'Bạn đang bận',
            declined: 'Bạn đã từ chối cuộc gọi',
            unavailable: 'Không thể kết nối'
        };

        setCallEndReason(reasonMessages[reason]);

        socket.emit('rejectCall', {
            callerId: incomingCall.callerId,
            reason,
            callType: incomingCall.callType
        });

        setIncomingCall(null);
        setCallStatus('idle');
        resetCallState();
        stopAutoEndTimer();

        setTimeout(() => {
            setCallEndReason(null);
        }, 3000);
    };

    // End call function
    const endCall = async (reason?: 'timeout' | 'manual') => {
        console.log('📞 Ending call...', reason ? `Reason: ${reason}` : '', 'Type:', callType);

        try {
            if (!callEndReason) {
                if (reason === 'timeout') {
                    setCallEndReason('Cuộc gọi đã hết thời gian');
                } else {
                    setCallEndReason('Cuộc gọi đã kết thúc');
                }
            }

            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
            }

            stopAutoEndTimer();

            setRoom(null);
            setIsInCall(false);
            setCallStatus(reason === 'timeout' ? 'timeout' : 'ended');
            setLocalParticipant(null);
            setRemoteParticipants([]);
            setConnectionState(ConnectionState.Disconnected);
            setIncomingCall(null);

            if (socket && currentUserId) {
                socket.emit('endCall', {
                    userId: currentUserId,
                    callData: {
                        endedBy: currentUserId,
                        reason: reason || 'manual',
                        callType: callType
                    }
                });
            }

            // Reset call state after a delay
            setTimeout(() => {
                resetCallState();
            }, 1000);

            setTimeout(() => {
                setCallStatus('idle');
                setAutoEndMessage(null);
                setTimeout(() => {
                    setCallEndReason(null);
                }, 2000);
            }, reason === 'timeout' ? 5000 : 2000);

            console.log(`✅ ${callType} call ended successfully`);
        } catch (error) {
            console.error('❌ Error ending call:', error);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
            stopAutoEndTimer();
            resetCallState();
        };
    }, []);

    return {
        // States
        room,
        isInCall,
        incomingCall,
        callStatus,
        localParticipant,
        remoteParticipants,
        connectionState,
        autoEndMessage,
        callEndReason,
        callType,

        // Enhanced name management
        callerName,
        receiverName,
        remoteUserName: getRemoteUserName(),
        isInitiator,

        // Actions
        initiateCall,
        acceptCall,
        rejectCall,
        endCall: () => endCall('manual')
    };
};