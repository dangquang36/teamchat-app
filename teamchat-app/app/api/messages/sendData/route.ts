// app/api/messages/sendData/route.ts
import { RoomServiceClient, DataPacket_Kind } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  try {
    // Chúng ta sẽ dùng một cấu trúc payload chung
    const { recipientId, eventType, payload } = await req.json();

    if (!recipientId || !eventType || !payload) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin recipientId, eventType, hoặc payload' },
        { status: 400 }
      );
    }

    // Tên phòng của người nhận
    const roomName = `notifications-${recipientId}`;

    // Dữ liệu cuối cùng để gửi đi, bao gồm cả loại sự kiện
    const dataToSend = {
      type: eventType,
      payload: payload,
    };

    const encodedData = new TextEncoder().encode(JSON.stringify(dataToSend));

    await roomService.sendData(roomName, encodedData, DataPacket_Kind.RELIABLE);

    return NextResponse.json({ success: true, message: 'Đã gửi thông báo thành công.' });

  } catch (error: any) {
    console.error('Lỗi khi gửi thông báo qua LiveKit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}