import { useState, useEffect, useRef } from 'react';
import { Room, RemoteParticipant, LocalParticipant, ConnectionState } from 'livekit-client';
import { Socket } from 'socket.io-client';

export interface CallData {
    callerId: string;
    receiverId: string;
    callerName: string;
    roomName: string;
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'rejected' | 'ended' | 'connecting' | 'timeout' | 'busy' | 'unavailable';

export const useCall = (socket: Socket | null, currentUserId: string) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
    const [autoEndMessage, setAutoEndMessage] = useState<string | null>(null);
    const [callEndReason, setCallEndReason] = useState<string | null>(null);

    const roomRef = useRef<Room | null>(null);
    const autoEndTimerRef = useRef<NodeJS.Timeout | null>(null);
    const callStartTimeRef = useRef<number | null>(null);

    // Hàm bắt đầu timer tự động tắt cuộc gọi (2 phút)
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
        }, 2 * 60 * 1000); // 2 phút
    };

    // Hàm dừng timer tự động tắt cuộc gọi
    const stopAutoEndTimer = () => {
        console.log('🛑 Stopping auto-end timer...');
        if (autoEndTimerRef.current) {
            clearTimeout(autoEndTimerRef.current);
            autoEndTimerRef.current = null;
        }
    };

    // Hàm kiểm tra và quản lý timer dựa trên số lượng participants
    const manageAutoEndTimer = (remoteCount: number) => {
        if (remoteCount === 0) {
            // Không có remote participants, bắt đầu timer
            if (!autoEndTimerRef.current) {
                startAutoEndTimer();
            }
        } else {
            // Có remote participants, dừng timer
            stopAutoEndTimer();
        }
    };

    // Hàm yêu cầu quyền truy cập camera và mic với retry logic
    const requestMediaPermissions = async (): Promise<boolean> => {
        try {
            console.log('🎥 Requesting media permissions...');

            // Kiểm tra xem có permissions chưa
            const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
            console.log('Camera permission status:', permissions.state);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            console.log('✅ Media permissions granted, stream tracks:', stream.getTracks().map(t => t.kind));

            // Dừng stream tạm thời vì LiveKit sẽ tự quản lý
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            console.error('❌ Error requesting media permissions:', error);
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    alert('Vui lòng cho phép truy cập camera và microphone để thực hiện cuộc gọi');
                } else if (error.name === 'NotFoundError') {
                    alert('Không tìm thấy camera hoặc microphone');
                } else if (error.name === 'NotReadableError') {
                    alert('Camera hoặc microphone đang được sử dụng bởi ứng dụng khác');
                }
            }
            return false;
        }
    };

    // Setup socket listeners
    useEffect(() => {
        if (!socket || !currentUserId) return;

        const handleIncomingCall = (callData: CallData) => {
            console.log('📞 Incoming call from:', callData.callerName);
            setIncomingCall(callData);
            setCallStatus('ringing');
        };

        const handleCallAccepted = async (callData: CallData) => {
            console.log('✅ Call accepted, connecting to room:', callData.roomName);
            setCallStatus('connected');
        };

        const handleCallRejected = (data: { reason: string; message: string }) => {
            console.log('❌ Call rejected:', data.message);
            setCallStatus('rejected');
            setIncomingCall(null);

            // Set call end reason based on rejection reason
            const reasonMessages = {
                busy: 'Người dùng đang bận',
                declined: 'Cuộc gọi bị từ chối',
                unavailable: 'Người dùng không có sẵn'
            };
            setCallEndReason(reasonMessages[data.reason as keyof typeof reasonMessages] || 'Cuộc gọi không thành công');

            // Cleanup room nếu có
            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            // Dừng timer
            stopAutoEndTimer();

            // Reset sau 3 giây
            setTimeout(() => {
                setCallStatus('idle');
                setCallEndReason(null);
            }, 3000);
        };

        const handleCallEnded = (data: any) => {
            console.log('📞 Call ended by:', data.endedBy);
            if (data.reason === 'timeout') {
                setCallEndReason('Người dùng đã ngắt kết nối');
            } else if (data.reason === 'disconnect') {
                setCallEndReason('Mất kết nối với người dùng');
            } else {
                setCallEndReason('Cuộc gọi đã kết thúc');
            }
            endCall();
        };

        // Thêm handler cho call timeout
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

        // Listen for call status changes
        socket.on('callStatusChange', (data: { type: string; message?: string }) => {
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
    }, [socket, currentUserId]);

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

            // Bắt đầu quản lý timer dựa trên số lượng remote participants
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
                // Dừng timer khi có người tham gia
                manageAutoEndTimer(newParticipants.length);
                return newParticipants;
            });
            setCallStatus('connected');
        });

        roomInstance.on('participantDisconnected', (participant: RemoteParticipant) => {
            console.log('👤 Participant disconnected:', participant.identity);
            setRemoteParticipants(prev => {
                const newParticipants = prev.filter(p => p.identity !== participant.identity);
                // Quản lý timer dựa trên số lượng participants còn lại
                manageAutoEndTimer(newParticipants.length);
                return newParticipants;
            });

            // Set reason when participant disconnects
            setCallEndReason('Người dùng đã rời cuộc gọi');
        });

        roomInstance.on('trackSubscribed', (track, publication, participant) => {
            console.log('📡 Track subscribed:', track.kind, 'from', participant.identity);
        });

        roomInstance.on('trackUnsubscribed', (track, publication, participant) => {
            console.log('📡 Track unsubscribed:', track.kind, 'from', participant.identity);
        });
    };

    const initiateCall = async (receiverId: string, receiverName: string) => {
        if (!socket) {
            console.error('❌ Socket not connected');
            return { success: false, error: 'Socket not connected' };
        }

        if (!currentUserId) {
            console.error('❌ Current user ID not available');
            return { success: false, error: 'User not authenticated' };
        }

        try {
            console.log('📞 Initiating call to:', receiverName, 'ID:', receiverId);
            setCallStatus('calling');
            setAutoEndMessage(null); // Reset message
            setCallEndReason(null); // Reset reason

            // Kiểm tra quyền truy cập media trước
            const hasPermissions = await requestMediaPermissions();
            if (!hasPermissions) {
                setCallStatus('idle');
                return { success: false, error: 'Không thể truy cập camera/microphone' };
            }

            // Gọi API để tạo room và lấy token
            console.log('🌐 Calling API to create room...');
            const response = await fetch('/api/call/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callerId: currentUserId,
                    receiverId,
                    callerName: receiverName
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API call failed:', response.status, errorText);
                throw new Error(`API call failed: ${response.status} ${errorText}`);
            }

            const { roomName, token, wsUrl } = await response.json();
            console.log('✅ API response received:', { roomName, wsUrl: wsUrl ? 'present' : 'missing' });

            // Tạo room instance với cấu hình tối ưu
            const roomInstance = new Room({
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
                }
            });

            roomRef.current = roomInstance;
            setRoom(roomInstance);

            // Setup events trước khi connect
            setupRoomEvents(roomInstance);

            console.log('🔗 Connecting to LiveKit room...');
            setCallStatus('connecting');

            // Connect đến room với token
            await roomInstance.connect(wsUrl, token);
            console.log('✅ Connected to LiveKit room successfully');

            // Set local participant sau khi connect thành công
            setLocalParticipant(roomInstance.localParticipant);

            // Enable camera và microphone với retry logic
            try {
                console.log('🎥 Enabling camera and microphone...');
                await roomInstance.localParticipant.enableCameraAndMicrophone();
                console.log('✅ Camera and microphone enabled');
            } catch (enableError) {
                console.error('❌ Error enabling camera/microphone:', enableError);
                // Thử enable từng cái một
                try {
                    await roomInstance.localParticipant.setMicrophoneEnabled(true);
                    await roomInstance.localParticipant.setCameraEnabled(true);
                    console.log('✅ Camera and microphone enabled individually');
                } catch (individualError) {
                    console.error('❌ Failed to enable media individually:', individualError);
                }
            }

            // Gửi thông báo cuộc gọi đến receiver thông qua socket
            console.log('📤 Sending call notification via socket...');
            socket.emit('initiateCall', {
                receiverId,
                callData: {
                    callerId: currentUserId,
                    receiverId,
                    callerName: receiverName,
                    roomName
                }
            });

            console.log('✅ Call initiated successfully');
            return { success: true, roomName };

        } catch (error) {
            console.error('❌ Error initiating call:', error);
            setCallStatus('idle');
            setCallEndReason('Không thể khởi tạo cuộc gọi');

            // Cleanup room nếu có lỗi
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

    const acceptCall = async () => {
        if (!incomingCall || !socket) {
            console.error('❌ No incoming call or socket not connected');
            return { success: false, error: 'No incoming call' };
        }

        try {
            console.log('✅ Accepting call from:', incomingCall.callerName);
            setCallStatus('connecting');
            setAutoEndMessage(null); // Reset message
            setCallEndReason(null); // Reset reason

            // Kiểm tra quyền truy cập media
            const hasPermissions = await requestMediaPermissions();
            if (!hasPermissions) {
                setCallEndReason('Không thể truy cập camera/microphone');
                rejectCall('unavailable');
                return { success: false, error: 'Không thể truy cập camera/microphone' };
            }

            // Gọi API để lấy token cho receiver
            const response = await fetch('/api/call/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: currentUserId,
                    roomName: incomingCall.roomName,
                    callerId: incomingCall.callerId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to accept call');
            }

            const { token, wsUrl } = await response.json();

            // Tạo room instance mới cho receiver
            const roomInstance = new Room({
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
                }
            });

            roomRef.current = roomInstance;
            setRoom(roomInstance);

            // Setup events
            setupRoomEvents(roomInstance);

            // Connect đến room
            await roomInstance.connect(wsUrl, token);

            // Set local participant sau khi connect
            setLocalParticipant(roomInstance.localParticipant);

            // Enable camera và microphone
            await roomInstance.localParticipant.enableCameraAndMicrophone();

            // Thông báo cho caller rằng call đã được chấp nhận
            socket.emit('acceptCall', {
                callerId: incomingCall.callerId,
                callData: {
                    ...incomingCall,
                    receiverId: currentUserId
                }
            });

            setIncomingCall(null);
            console.log('✅ Call accepted successfully');
            return { success: true };

        } catch (error) {
            console.error('❌ Error accepting call:', error);
            setCallStatus('idle');
            setIncomingCall(null);
            setCallEndReason('Không thể chấp nhận cuộc gọi');

            // Cleanup room nếu có lỗi
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            stopAutoEndTimer();

            return { success: false, error: 'Failed to accept call' };
        }
    };

    const rejectCall = (reason: 'busy' | 'declined' | 'unavailable' = 'declined') => {
        if (!incomingCall || !socket) return;

        console.log('❌ Rejecting call, reason:', reason);

        const reasonMessages = {
            busy: 'Bạn đang bận',
            declined: 'Bạn đã từ chối cuộc gọi',
            unavailable: 'Không thể kết nối'
        };

        setCallEndReason(reasonMessages[reason]);

        socket.emit('rejectCall', {
            callerId: incomingCall.callerId,
            reason
        });

        setIncomingCall(null);
        setCallStatus('idle');
        stopAutoEndTimer();

        // Reset reason after 3 seconds
        setTimeout(() => {
            setCallEndReason(null);
        }, 3000);
    };

    const endCall = async (reason?: 'timeout' | 'manual') => {
        console.log('📞 Ending call...', reason ? `Reason: ${reason}` : '');

        try {
            // Set reason if not already set
            if (!callEndReason) {
                if (reason === 'timeout') {
                    setCallEndReason('Cuộc gọi đã hết thời gian');
                } else {
                    setCallEndReason('Cuộc gọi đã kết thúc');
                }
            }

            // Cleanup room
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
            }

            // Stop timer
            stopAutoEndTimer();

            // Reset states
            setRoom(null);
            setIsInCall(false);
            setCallStatus(reason === 'timeout' ? 'timeout' : 'ended');
            setLocalParticipant(null);
            setRemoteParticipants([]);
            setConnectionState(ConnectionState.Disconnected);
            setIncomingCall(null);

            // Thông báo qua socket
            if (socket && currentUserId) {
                socket.emit('endCall', {
                    userId: currentUserId,
                    callData: {
                        endedBy: currentUserId,
                        reason: reason || 'manual'
                    }
                });
            }

            // Reset status sau vài giây
            setTimeout(() => {
                setCallStatus('idle');
                setAutoEndMessage(null);
                // Keep callEndReason for a bit longer to show in chat
                setTimeout(() => {
                    setCallEndReason(null);
                }, 2000);
            }, reason === 'timeout' ? 5000 : 2000);

            console.log('✅ Call ended successfully');
        } catch (error) {
            console.error('❌ Error ending call:', error);
        }
    };

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
            stopAutoEndTimer();
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

        // Actions
        initiateCall,
        acceptCall,
        rejectCall,
        endCall: () => endCall('manual')
    };
};