"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";
import { SocketProvider, useSocketContext } from "@/contexts/SocketContext";
import { ChannelProvider } from "@/contexts/ChannelContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DirectMessage } from './types';
import { Toaster } from "@/components/ui/toaster";
import { useDebouncedToast } from "@/hooks/use-debounced-toast";
import { useChannels } from "@/contexts/ChannelContext";
import { ChannelInvitationModal } from "@/components/modals/hop/ChannelInvitationModal";
import { MeetingInvitationModal } from "@/components/modals/hop/MeetingInvitationModal";
import { NotificationService } from "@/services/notificationService";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

function AppController({ children }: { children: React.ReactNode }) {
  const { socket, isConnected } = useSocketContext();
  const { receiveNewMessage, addContact, showToast } = useChatContext();
  const { getChannelInvitations } = useChannels();
  const currentUser = useCurrentUser();
  const [pendingInvitation, setPendingInvitation] = useState<any>(null);
  const [pendingMeetingInvitation, setPendingMeetingInvitation] = useState<any>(null);
  const { debouncedToast } = useDebouncedToast();

  // Handle meeting invitation accept/decline
  const handleMeetingAccept = async (meetingData: any) => {
    // Navigate to meeting room
    window.open(`/meeting/${meetingData.roomName}`, '_blank');
  };

  const handleMeetingDecline = async (meetingData: any) => {
    // Just close the modal, no action needed
    console.log('Meeting declined:', meetingData);
  };

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
          debouncedToast('Cuộc gọi đã kết nối', {
            variant: 'success',
            title: '📞 Cuộc gọi'
          }, `call-connected`, 500);
          break;
        case 'ended':
          debouncedToast('Cuộc gọi đã kết thúc', {
            variant: 'default',
            title: '📞 Cuộc gọi'
          }, `call-ended`, 500);
          break;
        case 'rejected':
          if (status.message) {
            debouncedToast(status.message, {
              variant: 'destructive',
              title: '📞 Cuộc gọi'
            }, `call-rejected`, 500);
          }
          break;
        case 'error':
          debouncedToast(status.message || 'Lỗi cuộc gọi', {
            variant: 'destructive',
            title: '⚠️ Lỗi cuộc gọi'
          }, `call-error`, 500);
          break;
      }
    };

    // Handle channel invitation received - DISABLED: Only use notification bell
    const handleChannelInvitationReceived = (invitation: any) => {
      console.log('📨 Channel invitation received from server - forwarding to notification bell only:', invitation);
      // setPendingInvitation(invitation); // DISABLED: Don't show single invitation modal
      // showToast(`${invitation.inviterName} đã mời bạn tham gia kênh "${invitation.channelName}"`);
    };

    // Handle meeting notification received
    const handleMeetingNotificationReceived = (meetingData: any) => {
      console.log('Meeting notification received:', meetingData);
      setPendingMeetingInvitation(meetingData);
      showToast(`${meetingData.creatorName} đã tạo cuộc họp "${meetingData.title}" trong kênh "${meetingData.channelName}"`);
    };

    // Đăng ký các event listeners hiện tại
    socket.on('newMessage', handleNewMessage);
    socket.on('friendRequestAccepted', handleFriendRequestAccepted);
    socket.on('friendRequestReceived', handleFriendRequestReceived);
    socket.on('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);

    // Đăng ký call event listeners
    socket.on('incomingCallNotification', handleIncomingCallNotification);
    socket.on('callStatusChange', handleCallStatusChange);

    // Đăng ký channel invitation events
    socket.on('channelInvitationReceived', handleChannelInvitationReceived);

    // Đăng ký meeting notification events
    socket.on('meetingNotificationReceived', handleMeetingNotificationReceived);

    // Cleanup khi component unmount
    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('friendRequestAccepted', handleFriendRequestAccepted);
      socket.off('friendRequestReceived', handleFriendRequestReceived);
      socket.off('friendRequestAcceptedByOther', handleFriendRequestAcceptedByOther);

      // Cleanup call events
      socket.off('incomingCallNotification', handleIncomingCallNotification);
      socket.off('callStatusChange', handleCallStatusChange);

      // Cleanup channel invitation events
      socket.off('channelInvitationReceived', handleChannelInvitationReceived);

      // Cleanup meeting notification events
      socket.off('meetingNotificationReceived', handleMeetingNotificationReceived);
    };
  }, [socket, currentUser, receiveNewMessage, addContact, showToast]);

  // Đăng ký user với socket khi kết nối
  useEffect(() => {
    if (socket && currentUser && isConnected) {
      console.log('Registering user with socket:', {
        userId: currentUser.id,
        userName: currentUser.name,
        socketId: socket.id,
        isConnected
      });

      // Register user with socket using service
      const registrationResult = NotificationService.registerUserWithSocket(socket, currentUser.id, {
        name: currentUser.name,
        avatar: currentUser.avatar,
        email: currentUser.email
      });

      if (registrationResult.success) {
        console.log('User registered with socket successfully');

        // Test socket connection
        setTimeout(() => {
          console.log('Testing socket connection for user:', currentUser.id);
          NotificationService.testSocketConnection(socket, currentUser.id);
        }, 1000);
      } else {
        console.error('Failed to register user with socket:', registrationResult.error);
      }
    } else {
      console.log('Cannot register user with socket:', {
        hasSocket: !!socket,
        hasCurrentUser: !!currentUser,
        isConnected,
        currentUserId: currentUser?.id
      });
    }
  }, [socket, currentUser, isConnected]);

  return (
    <>
      {children}

      {/* Channel Invitation Modal - DISABLED: Only use notification bell */}
      {/* {pendingInvitation && (
        <ChannelInvitationModal
          isOpen={!!pendingInvitation}
          onClose={() => setPendingInvitation(null)}
          invitation={pendingInvitation}
        />
      )} */}

      {/* Meeting Invitation Modal - DISABLED: Only use channel chat notifications */}
      {/* {pendingMeetingInvitation && (
        <MeetingInvitationModal
          isOpen={!!pendingMeetingInvitation}
          onClose={() => setPendingMeetingInvitation(null)}
          meetingData={pendingMeetingInvitation}
          onAccept={handleMeetingAccept}
          onDecline={handleMeetingDecline}
        />
      )} */}
    </>
  );
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
                <ChannelProvider>
                  <AppController>
                    {children}
                  </AppController>
                  <Toaster />
                </ChannelProvider>
              </ChatProvider>
            </SocketProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}