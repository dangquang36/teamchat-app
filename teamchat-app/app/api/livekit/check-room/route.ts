import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.LIVEKIT_URL!;

export async function POST(request: NextRequest) {
    try {
        const { roomName } = await request.json();

        if (!roomName) {
            return NextResponse.json(
                { error: 'Thiếu tên phòng họp' },
                { status: 400 }
            );
        }

        console.log('🔍 Checking if room exists:', roomName);

        // Tạo room service client
        const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

        try {
            // Kiểm tra xem room có tồn tại và active không
            const rooms = await roomService.listRooms([roomName]);

            if (rooms.length > 0) {
                const room = rooms[0];
                const roomInfo = {
                    name: room.name,
                    participantCount: room.numParticipants,
                    creationTime: room.creationTime,
                    metadata: room.metadata
                };

                console.log('✅ Room found:', roomInfo);

                // Chỉ cho phép join nếu có ít nhất 1 người trong phòng
                // Hoặc phòng vừa được tạo (trong vòng 1 phút)
                const now = Date.now();
                const roomCreatedTime = Number(room.creationTime) / 1000000; // Convert nanoseconds to milliseconds
                const timeSinceCreation = now - roomCreatedTime;
                const oneMinute = 60 * 1000;

                const canJoin = room.numParticipants > 0 || timeSinceCreation < oneMinute;

                return NextResponse.json({
                    exists: true,
                    roomInfo,
                    canJoin,
                    message: room.numParticipants > 0
                        ? `Phòng đang có ${room.numParticipants} người tham gia`
                        : canJoin
                            ? 'Phòng vừa được tạo, có thể tham gia'
                            : 'Phòng chưa có ai tham gia'
                });

            } else {
                // Room không tồn tại
                console.log('❌ Room not found');

                return NextResponse.json({
                    exists: false,
                    roomInfo: null,
                    canJoin: false,
                    message: 'Phòng họp không tồn tại'
                });
            }

        } catch (roomError) {
            console.log('❌ Room check failed:', roomError);

            return NextResponse.json({
                exists: false,
                roomInfo: null,
                canJoin: false,
                message: 'Phòng họp không tồn tại hoặc chưa được khởi tạo'
            });
        }

    } catch (error) {
        console.error('❌ Error checking room:', error);
        return NextResponse.json(
            {
                error: 'Không thể kiểm tra phòng họp',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}