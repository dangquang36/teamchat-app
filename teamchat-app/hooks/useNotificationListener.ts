
import { useEffect } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { useCurrentUser } from './useCurrentUser';
import type { Message, DirectMessage } from "@/app/types";


interface NotificationListenerParams {
    receiveNewMessage: (chatId: string, newMessage: Message) => void;
    addContact: (newContact: DirectMessage) => void;
}

export function useNotificationListener({ receiveNewMessage, addContact }: NotificationListenerParams) {
    const currentUser = useCurrentUser();

    useEffect(() => {
        if (!currentUser) return;

        const notificationRoom = new Room();
        const roomName = `notifications-${currentUser.id}`;

        notificationRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
            // DEBUG: 1. Kiểm tra xem sự kiện có được nhận không
            console.log("--- Event Received from LiveKit! ---");

            const messageStr = new TextDecoder().decode(payload);
            try {
                const data = JSON.parse(messageStr);

                // DEBUG: 2. In ra dữ liệu đã được giải mã
                console.log("Parsed Data:", data);

                switch (data.type) {
                    case 'NEW_MESSAGE': {
                        // DEBUG: 3. Kiểm tra xem có vào đúng case không
                        console.log("Case 'NEW_MESSAGE' triggered!");
                        const newMessage: Message = data.payload.message;
                        const fromUserId = data.payload.fromUserId;
                        const chatId = [currentUser.id, fromUserId].sort().join('-');
                        receiveNewMessage(chatId, newMessage);
                        break;
                    }
                    case 'FRIEND_REQUEST_ACCEPTED': {
                        // DEBUG: 3. Kiểm tra xem có vào đúng case không
                        console.log("Case 'FRIEND_REQUEST_ACCEPTED' triggered!");
                        const newFriend: DirectMessage = data.payload;
                        addContact(newFriend);
                        break;
                    }
                    default:
                        console.log("Unknown event type:", data.type);
                        break;
                }
            } catch (e) {
                console.error("Lỗi xử lý thông báo:", e);
            }
        });

        const connectToNotificationRoom = async () => {
            try {
                const res = await fetch(`/api/videocall/join-room?roomName=${roomName}&participantName=${currentUser.name}_notifications&participantIdentity=${currentUser.id}_notifications`);
                const { token } = await res.json();
                await notificationRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
                console.log(`✅ Đã kết nối vào phòng thông báo: ${roomName}`);
            } catch (error) {
                console.error("Lỗi kết nối phòng thông báo:", error);
            }
        };

        connectToNotificationRoom();

        return () => {
            notificationRoom.disconnect();
        };
    }, [currentUser, receiveNewMessage, addContact]);
}