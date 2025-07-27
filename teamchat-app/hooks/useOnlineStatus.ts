// import { useState, useEffect, useCallback } from 'react';
// import { useSocketContext } from '@/contexts/SocketContext';
// import { useCurrentUser } from '@/hooks/useCurrentUser';

// export interface OnlineUser {
//     userId: string;
//     lastSeen: Date;
//     isOnline: boolean;
//     userInfo?: {
//         name: string;
//         avatar: string;
//         email: string;
//     };
// }

// export function useOnlineStatus() {
//     const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
//     const { socket, isConnected } = useSocketContext();
//     const currentUser = useCurrentUser();

//     // Update user status
//     const updateUserStatus = useCallback((userId: string, isOnline: boolean, lastSeen?: Date) => {
//         setOnlineUsers(prev => {
//             const newMap = new Map(prev);
//             const existingUser = newMap.get(userId);

//             newMap.set(userId, {
//                 userId,
//                 isOnline,
//                 lastSeen: lastSeen || new Date(),
//                 userInfo: existingUser?.userInfo
//             });

//             return newMap;
//         });
//     }, []);

//     useEffect(() => {
//         if (!socket || !currentUser || !isConnected) return;

//         console.log('🔌 Setting up online status listeners for user:', currentUser.id);

//         // Đăng ký user online khi kết nối
//         socket.emit('userOnline', {
//             userId: currentUser.id,
//             userInfo: {
//                 name: currentUser.name,
//                 avatar: currentUser.avatar,
//                 email: currentUser.email
//             }
//         });

//         // Lắng nghe danh sách users online ban đầu
//         const handleOnlineUsersList = (users: OnlineUser[]) => {
//             console.log('📋 Received online users list:', users);
//             const usersMap = new Map();
//             users.forEach(user => {
//                 usersMap.set(user.userId, {
//                     ...user,
//                     lastSeen: new Date(user.lastSeen)
//                 });
//             });
//             setOnlineUsers(usersMap);
//         };

//         // Lắng nghe khi user online
//         const handleUserWentOnline = (userData: OnlineUser) => {
//             console.log('🟢 User went online:', userData);
//             updateUserStatus(userData.userId, true, new Date());
//         };

//         // Lắng nghe khi user offline
//         const handleUserWentOffline = (userData: OnlineUser) => {
//             console.log('🔴 User went offline:', userData);
//             updateUserStatus(userData.userId, false, new Date(userData.lastSeen));
//         };

//         // Lắng nghe heartbeat response
//         const handlePong = () => {
//             console.log('💓 Heartbeat received');
//         };

//         // Đăng ký event listeners
//         socket.on('onlineUsersList', handleOnlineUsersList);
//         socket.on('userWentOnline', handleUserWentOnline);
//         socket.on('userWentOffline', handleUserWentOffline);
//         socket.on('pong', handlePong);

//         // Heartbeat để duy trì connection
//         const heartbeat = setInterval(() => {
//             if (socket.connected) {
//                 socket.emit('ping');
//             }
//         }, 30000); // 30 giây

//         // Xử lý khi trang bị ẩn/hiện
//         const handleVisibilityChange = () => {
//             if (document.hidden) {
//                 socket.emit('userAway', { userId: currentUser.id });
//             } else {
//                 socket.emit('userOnline', {
//                     userId: currentUser.id,
//                     userInfo: {
//                         name: currentUser.name,
//                         avatar: currentUser.avatar,
//                         email: currentUser.email
//                     }
//                 });
//             }
//         };

//         // Xử lý khi đóng trang
//         const handleBeforeUnload = () => {
//             socket.emit('userOffline', { userId: currentUser.id });
//         };

//         // Xử lý khi mất kết nối
//         const handleDisconnect = () => {
//             console.log('🔌 Socket disconnected, clearing online users');
//             setOnlineUsers(new Map());
//         };

//         // Xử lý khi kết nối lại
//         const handleReconnect = () => {
//             console.log('🔌 Socket reconnected, re-registering user');
//             socket.emit('userOnline', {
//                 userId: currentUser.id,
//                 userInfo: {
//                     name: currentUser.name,
//                     avatar: currentUser.avatar,
//                     email: currentUser.email
//                 }
//             });
//         };

//         // Đăng ký event listeners cho browser
//         document.addEventListener('visibilitychange', handleVisibilityChange);
//         window.addEventListener('beforeunload', handleBeforeUnload);
//         socket.on('disconnect', handleDisconnect);
//         socket.on('reconnect', handleReconnect);

//         // Cleanup function
//         return () => {
//             clearInterval(heartbeat);

//             // Cleanup event listeners
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//             window.removeEventListener('beforeunload', handleBeforeUnload);

//             socket.off('onlineUsersList', handleOnlineUsersList);
//             socket.off('userWentOnline', handleUserWentOnline);
//             socket.off('userWentOffline', handleUserWentOffline);
//             socket.off('pong', handlePong);
//             socket.off('disconnect', handleDisconnect);
//             socket.off('reconnect', handleReconnect);

//             // Thông báo user offline khi cleanup
//             if (socket.connected) {
//                 socket.emit('userOffline', { userId: currentUser.id });
//             }
//         };
//     }, [socket, currentUser, isConnected, updateUserStatus]);

//     // Helper functions
//     const isUserOnline = useCallback((userId: string): boolean => {
//         const user = onlineUsers.get(userId);
//         return user?.isOnline || false;
//     }, [onlineUsers]);

//     const getUserLastSeen = useCallback((userId: string): Date | null => {
//         const user = onlineUsers.get(userId);
//         return user?.lastSeen || null;
//     }, [onlineUsers]);

//     const getFormattedLastSeen = useCallback((userId: string): string => {
//         const lastSeen = getUserLastSeen(userId);
//         if (!lastSeen) return 'Chưa xác định';

//         const now = new Date();
//         const diff = now.getTime() - lastSeen.getTime();
//         const minutes = Math.floor(diff / 60000);
//         const hours = Math.floor(diff / 3600000);
//         const days = Math.floor(diff / 86400000);

//         if (minutes < 1) return 'Vừa xong';
//         if (minutes < 60) return `${minutes} phút trước`;
//         if (hours < 24) return `${hours} giờ trước`;
//         if (days < 7) return `${days} ngày trước`;

//         return lastSeen.toLocaleDateString('vi-VN');
//     }, [getUserLastSeen]);

//     const getOnlineCount = useCallback((): number => {
//         return Array.from(onlineUsers.values()).filter(user => user.isOnline).length;
//     }, [onlineUsers]);

//     return {
//         onlineUsers,
//         isUserOnline,
//         getUserLastSeen,
//         getFormattedLastSeen,
//         getOnlineCount,
//         isConnected
//     };
// }