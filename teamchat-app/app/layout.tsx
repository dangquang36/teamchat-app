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
  const { socket } = useSocketContext();
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

    // Đăng ký các event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('friendRequestReceived', handleFriendRequestReceived);
    socket.on('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);

    // Cleanup khi component unmount
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('friendRequestReceived', handleFriendRequestReceived);
      socket.off('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);
    };
  }, [socket, currentUser, receiveNewMessage, addContact, showToast]);

  // Đăng ký user với socket khi kết nối
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('userOnline', {
        userId: currentUser.id,
        userInfo: {
          name: currentUser.name,
          avatar: currentUser.avatar,
          email: currentUser.email
        }
      });
    }
  }, [socket, currentUser]);

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