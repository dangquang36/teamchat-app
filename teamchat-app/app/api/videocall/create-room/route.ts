import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../../../../src/services/livekit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomName } = body;

        if (!roomName) {
            return NextResponse.json(
                { error: 'Room name is required' },
                { status: 400 }
            );
        }

        const token = await generateToken(roomName, 'room-creator');

        return NextResponse.json({
            success: true,
            roomName,
            token,
            livekitUrl: process.env.LIVEKIT_URL || 'wss://duan-kryqhcty.livekit.cloud'
        });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: 'Failed to create room' },
            { status: 500 }
        );
    }
}