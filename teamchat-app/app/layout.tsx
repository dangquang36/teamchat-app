"use client";

import "./globals.css";
import { useEffect } from "react";
import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";
import { SocketProvider, useSocketContext } from "@/contexts/SocketContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DirectMessage } from './types';

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

function AppController({ children }: { children: React.ReactNode }) {
  const { socket, isConnected } = useSocketContext();
  const { receiveNewMessage, addContact, showToast } = useChatContext();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!socket || !currentUser) return;

    // Handle new messages
    const handleNewMessage = (payload: any) => {
      const { message, fromUserId } = payload;
      // Tạo chatId consistent từ 2 userId
      const chatId = [fromUserId, currentUser.id].sort().join('-');
      receiveNewMessage(chatId, message);

      // Hiển thị thông báo nếu không phải tab active
      if (document.hidden) {
        showToast(`Tin nhắn mới từ ${message.senderName || 'ai đó'}`);
      }
    };

    // Handle friend request accepted
    const handleFriendRequestAccepted = (newFriend: DirectMessage) => {
      addContact(newFriend);
      showToast(`Bạn và ${newFriend.name} đã trở thành bạn bè!`);
    };

    // Handle incoming friend requests
    const handleFriendRequestReceived = (requestData: any) => {
      console.log('Friend request received in layout:', requestData);
      // This will be handled by FriendRequestList component
      // Just show a toast notification here
      showToast(`${requestData.requesterName} đã gửi lời mời kết bạn!`);
    };

    // Handle when someone accepts your friend request
    const handleFriendRequestAcceptedByOther = (friendData: any) => {
      console.log('Your friend request was accepted:', friendData);
      addContact(friendData);
      showToast(`${friendData.name} đã chấp nhận lời mời kết bạn của bạn!`);
    };


    // Handle incoming call notifications (for toast only)
    const handleIncomingCallNotification = (callData: any) => {
      console.log('Incoming call notification in layout:', callData);
      // The actual modal is handled in SocketProvider
      // This is just for additional notifications if needed
      if (document.hidden) {
        showToast(`Cuộc gọi từ ${callData.callerName}`);
      }
    };

    // Handle call status changes
    const handleCallStatusChange = (status: { type: string; message?: string }) => {
      console.log('Call status change:', status);

      switch (status.type) {
        case 'connected':
          showToast('Cuộc gọi đã kết nối');
          break;
        case 'ended':
          showToast('Cuộc gọi đã kết thúc');
          break;
        case 'rejected':
          if (status.message) {
            showToast(status.message);
          }
          break;
        case 'error':
          showToast(status.message || 'Lỗi cuộc gọi');
          break;
      }
    };

    // Đăng ký các event listeners hiện tại
    socket.on('newMessage', handleNewMessage);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('friendRequestReceived', handleFriendRequestReceived);
    socket.on('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);

    // Đăng ký call event listeners
    socket.on('incomingCallNotification', handleIncomingCallNotification);
    socket.on('callStatusChange', handleCallStatusChange);

    // Cleanup khi component unmount
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('friendRequestReceived', handleFriendRequestReceived);
      socket.off('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);

      // Cleanup call events
      socket.off('incomingCallNotification', handleIncomingCallNotification);
      socket.off('callStatusChange', handleCallStatusChange);
    };
  }, [socket, currentUser, receiveNewMessage, addContact, showToast]);

  // Đăng ký user với socket khi kết nối
  useEffect(() => {
    if (socket && currentUser && isConnected) {
      console.log('Registering user with socket:', currentUser.id);

      socket.emit('userOnline', {
        userId: currentUser.id,
        userInfo: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          email: currentUser.email
        }
      });

      // Emit join event for call functionality
      socket.emit('join', currentUser.id);
    }
  }, [socket, currentUser, isConnected]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SocketProvider>
              <ChatProvider>
                <AppController>
                  {children}
                </AppController>
              </ChatProvider>
            </SocketProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}