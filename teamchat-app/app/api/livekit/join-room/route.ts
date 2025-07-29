import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

export async function POST(request: NextRequest) {
    try {
        const { roomName, participantName, participantId, metadata } = await request.json();

        if (!roomName || !participantName || !participantId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        console.log('🏠 Creating LiveKit token for meeting:', {
            roomName,
            participantName,
            participantId
        });

        // Tạo token cho participant
        const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: `meeting_${participantId}_${Date.now()}`,
            name: participantName,
            metadata: JSON.stringify({
                userId: participantId,
                joinedAt: Date.now(),
                ...metadata
            })
        });

        // Cấp quyền cho participant
        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true, // Cho phép gửi chat messages
            canUpdateOwnMetadata: true,
            roomAdmin: false,
            roomList: false,
            roomRecord: false,
            roomCreate: false
        });

        const jwt = token.toJwt();

        console.log('✅ LiveKit token created successfully');

        return NextResponse.json({
            token: jwt,
            wsUrl: LIVEKIT_URL,
            roomName,
            participantId
        });

    } catch (error) {
        console.error('❌ Error creating LiveKit token:', error);
        return NextResponse.json(
            { error: 'Failed to create meeting token' },
            { status: 500 }
        );
    }
}