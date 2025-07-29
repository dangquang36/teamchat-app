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

            let roomExists = false;
            let participantCount = 0;
            let roomInfo = null;

            if (rooms.length > 0) {
                const room = rooms[0];
                roomExists = true;
                participantCount = room.numParticipants;
                roomInfo = {
                    name: room.name,
                    participantCount: room.numParticipants,
                    creationTime: room.creationTime,
                    metadata: room.metadata
                };

                console.log('✅ Room found:', roomInfo);
            } else {
                // Nếu room chưa tồn tại, LiveKit sẽ tự động tạo khi có participant đầu tiên join
                console.log('📝 Room does not exist yet, will be created on first join');
                roomExists = true; // Cho phép join vì LiveKit sẽ tự tạo
            }

            return NextResponse.json({
                exists: roomExists,
                roomInfo,
                canJoin: true,
                message: roomExists && participantCount > 0
                    ? `Phòng đang có ${participantCount} người tham gia`
                    : 'Phòng họp sẵn sàng để tham gia'
            });

        } catch (roomError) {
            // Nếu API trả về lỗi, có thể room chưa tồn tại
            // Nhưng với LiveKit, room sẽ được tạo tự động khi có người join
            console.log('⚠️ Room check failed, but allowing join (auto-create):', roomError);

            return NextResponse.json({
                exists: false,
                roomInfo: null,
                canJoin: true,
                message: 'Phòng họp sẽ được tạo khi bạn tham gia'
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