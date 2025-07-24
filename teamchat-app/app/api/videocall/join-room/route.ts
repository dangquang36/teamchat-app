import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Sửa lại hàm từ POST thành GET
export async function GET(req: NextRequest) {
    try {
        // Lấy các tham số từ URL
        const { searchParams } = new URL(req.url);
        const roomName = searchParams.get('roomName');
        const participantName = searchParams.get('participantName');
        let participantIdentity = searchParams.get('participantIdentity');

        // Nếu không có participantIdentity riêng, dùng participantName
        if (!participantIdentity) {
            participantIdentity = participantName;
        }

        if (!roomName || !participantName || !participantIdentity) {
            return NextResponse.json(
                { error: 'Thiếu thông tin roomName, participantName, hoặc participantIdentity' },
                { status: 400 }
            );
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
            throw new Error('LiveKit API Key hoặc Secret chưa được cấu hình');
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: participantIdentity,
            name: participantName,
            ttl: '10m', // Token có hiệu lực 10 phút
        });

        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        });

        return NextResponse.json({
            success: true,
            token: at.toJwt(),
        });
    } catch (error) {
        console.error('Lỗi khi tạo token:', error);
        return NextResponse.json(
            { error: 'Không thể tạo token' },
            { status: 500 }
        );
    }
}