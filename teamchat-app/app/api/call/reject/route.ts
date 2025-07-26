
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { callerId, receiverId, reason = 'busy' } = await request.json();

        if (!callerId) {
            return NextResponse.json(
                { error: 'Missing callerId' },
                { status: 400 }
            );
        }

        // Logic để thông báo caller qua Socket.IO sẽ được xử lý ở client side

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error rejecting call:', error);
        return NextResponse.json(
            { error: 'Failed to reject call' },
            { status: 500 }
        );
    }
}