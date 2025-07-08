import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '../../../../src/services/livekit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomName, participantName } = body;

        if (!roomName || !participantName) {
            return NextResponse.json(
                { error: 'Room name and participant name are required' },
                { status: 400 }
            );
        }

        const token = await generateToken(roomName, participantName);

        return NextResponse.json({
            success: true,
            token,
            livekitUrl: process.env.LIVEKIT_URL || 'wss://duan-kryqhcty.livekit.cloud'
        });
    } catch (error) {
        console.error('Error joining room:', error);
        return NextResponse.json(
            { error: 'Failed to join room' },
            { status: 500 }
        );
    }
}