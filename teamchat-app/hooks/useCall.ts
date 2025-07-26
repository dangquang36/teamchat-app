
import { useState, useEffect, useRef } from 'react';
import { Room, RemoteParticipant, LocalParticipant, ConnectionState } from 'livekit-client';
import { Socket } from 'socket.io-client';

export interface CallData {
    callerId: string;
    receiverId: string;
    callerName: string;
    roomName: string;
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'rejected' | 'ended' | 'connecting';

export const useCall = (socket: Socket | null, currentUserId: string) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);

    const roomRef = useRef<Room | null>(null);

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

            // Cleanup room nếu có
            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            // Reset sau 3 giây
            setTimeout(() => {
                setCallStatus('idle');
            }, 3000);
        };

        const handleCallEnded = (data: any) => {
            console.log('📞 Call ended by:', data.endedBy);
            endCall();
        };

        socket.on('incomingCall', handleIncomingCall);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('callRejected', handleCallRejected);
        socket.on('callEnded', handleCallEnded);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('callRejected', handleCallRejected);
            socket.off('callEnded', handleCallEnded);
        };
    }, [socket, currentUserId]);

    const setupRoomEvents = (roomInstance: Room) => {
        console.log('🏠 Setting up room events...');

        roomInstance.on('connected', () => {
            console.log('✅ Connected to LiveKit room');
            setConnectionState(ConnectionState.Connected);
            setIsInCall(true);
            setCallStatus('connected');

            setLocalParticipant(roomInstance.localParticipant);
            setRemoteParticipants(Array.from(roomInstance.participants.values()));

            console.log(`🏠 Room connected. Local: ${roomInstance.localParticipant.identity}, Remotes found: ${roomInstance.participants.size}`);
        });

        roomInstance.on('disconnected', () => {
            console.log('❌ Disconnected from LiveKit room');
            setConnectionState(ConnectionState.Disconnected);
            setIsInCall(false);
            setLocalParticipant(null);
            setRemoteParticipants([]);
        });

        roomInstance.on('participantConnected', (participant: RemoteParticipant) => {
            console.log('👤 Participant connected:', participant.identity);
            setRemoteParticipants(prev => [...prev, participant]);
            setCallStatus('connected');
        });

        roomInstance.on('participantDisconnected', (participant: RemoteParticipant) => {
            console.log('👤 Participant disconnected:', participant.identity);
            setRemoteParticipants(prev => prev.filter(p => p.identity !== participant.identity));
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

            // Cleanup room nếu có lỗi
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

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

            // Kiểm tra quyền truy cập media
            const hasPermissions = await requestMediaPermissions();
            if (!hasPermissions) {
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

            // Cleanup room nếu có lỗi
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
                setRoom(null);
            }

            return { success: false, error: 'Failed to accept call' };
        }
    };

    const rejectCall = (reason: 'busy' | 'declined' | 'unavailable' = 'declined') => {
        if (!incomingCall || !socket) return;

        console.log('❌ Rejecting call, reason:', reason);

        socket.emit('rejectCall', {
            callerId: incomingCall.callerId,
            reason
        });

        setIncomingCall(null);
        setCallStatus('idle');
    };

    const endCall = async () => {
        console.log('📞 Ending call...');

        try {
            // Cleanup room
            if (roomRef.current) {
                await roomRef.current.disconnect();
                roomRef.current = null;
            }

            // Reset states
            setRoom(null);
            setIsInCall(false);
            setCallStatus('idle');
            setLocalParticipant(null);
            setRemoteParticipants([]);
            setConnectionState(ConnectionState.Disconnected);
            setIncomingCall(null);

            // Thông báo qua socket
            if (socket && currentUserId) {
                socket.emit('endCall', {
                    userId: currentUserId,
                    callData: { endedBy: currentUserId }
                });
            }

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

        // Actions
        initiateCall,
        acceptCall,
        rejectCall,
        endCall
    };
};