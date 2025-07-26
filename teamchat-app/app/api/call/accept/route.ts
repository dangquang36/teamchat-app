// app/api/call/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Cấu hình LiveKit - thay thế bằng thông tin thực tế của bạn
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'ws://localhost:7880';

export async function POST(request: NextRequest) {
    try {
        const { receiverId, roomName, callerId } = await request.json();

        if (!receiverId || !roomName || !callerId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        console.log('✅ Creating token for receiver:', { receiverId, roomName });

        // Tạo token cho receiver
        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `receiver_${receiverId}`,
            name: 'Receiver',
        });

        // Grant permissions
        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        const jwt = token.toJwt();

        console.log('✅ Token created for receiver:', `receiver_${receiverId}`);

        return NextResponse.json({
            token: jwt,
            wsUrl: LIVEKIT_URL,
            roomName,
            receiverId
        });

    } catch (error) {
        console.error('❌ Error accepting call:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}