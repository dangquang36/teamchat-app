// app/api/call/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Cấu hình LiveKit - thay thế bằng thông tin thực tế của bạn
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

export async function POST(request: NextRequest) {
    try {
        const { callerId, receiverId, callerName } = await request.json();

        if (!callerId || !receiverId) {
            return NextResponse.json(
                { error: 'Missing callerId or receiverId' },
                { status: 400 }
            );
        }

        console.log('🏠 Creating room for call:', { callerId, receiverId, callerName });

        // Tạo room name unique
        const roomName = `call_${callerId}_${receiverId}_${Date.now()}`;

        // Tạo token cho caller
        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `caller_${callerId}`,
            name: callerName || 'Caller',
        });

        // Grant permissions
        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        const jwt = token.toJwt();

        console.log('✅ Token created for caller:', `caller_${callerId}`);

        return NextResponse.json({
            roomName,
            token: jwt,
            wsUrl: LIVEKIT_URL,
            callerId,
            receiverId
        });

    } catch (error) {
        console.error('❌ Error creating call room:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}