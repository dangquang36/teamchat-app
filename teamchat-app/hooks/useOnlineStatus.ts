// import { useState, useEffect } from 'react';
// import { useSocketContext } from '@/contexts/SocketContext';
// import { useCurrentUser } from '@/hooks/useCurrentUser';

// export interface OnlineUser {
//     userId: string;
//     lastSeen: Date;
//     isOnline: boolean;
// }

// export function useOnlineStatus() {
//     const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
//     const { socket } = useSocketContext();
//     const currentUser = useCurrentUser();

//     useEffect(() => {
//         if (!socket || !currentUser) return;

//         // Đăng ký user online khi kết nối
//         socket.emit('userOnline', {
//             userId: currentUser.id,
//             userInfo: {
//                 name: currentUser.name,
//                 avatar: currentUser.avatar,
//                 email: currentUser.email
//             }
//         });

//         // Lắng nghe danh sách users online
//         socket.on('onlineUsersList', (users: OnlineUser[]) => {
//             const usersMap = new Map();
//             users.forEach(user => {
//                 usersMap.set(user.userId, user);
//             });
//             setOnlineUsers(usersMap);
//         });

//         // Lắng nghe khi user online
//         socket.on('userWentOnline', (userData: OnlineUser) => {
//             setOnlineUsers(prev => {
//                 const newMap = new Map(prev);
//                 newMap.set(userData.userId, userData);
//                 return newMap;
//             });
//         });

//         // Lắng nghe khi user offline
//         socket.on('userWentOffline', (userData: OnlineUser) => {
//             setOnlineUsers(prev => {
//                 const newMap = new Map(prev);
//                 newMap.set(userData.userId, { ...userData, isOnline: false });
//                 return newMap;
//             });
//         });

//         // Heartbeat để duy trì connection
//         const heartbeat = setInterval(() => {
//             socket.emit('ping');
//         }, 30000); // 30 giây

//         // Cleanup khi component unmount hoặc user offline
//         const handleBeforeUnload = () => {
//             socket.emit('userOffline', { userId: currentUser.id });
//         };

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

//         window.addEventListener('beforeunload', handleBeforeUnload);
//         document.addEventListener('visibilitychange', handleVisibilityChange);

//         return () => {
//             clearInterval(heartbeat);
//             window.removeEventListener('beforeunload', handleBeforeUnload);
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
            
//             socket.off('onlineUsersList');
//             socket.off('userWentOnline');
//             socket.off('userWentOffline');
            
//             // Thông báo user offline khi cleanup
//             socket.emit('userOffline', { userId: currentUser.id });
//         };
//     }, [socket, currentUser]);

//     // Helper functions
//     const isUserOnline = (userId: string): boolean => {
//         const user = onlineUsers.get(userId);
//         return user?.isOnline || false;
//     };

//     const getUserLastSeen = (userId: string): Date | null => {
//         const user = onlineUsers.get(userId);
//         return user?.lastSeen || null;
//     };

//     const getFormattedLastSeen = (userId: string): string => {
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
//     };

//     return {
//         onlineUsers,
//         isUserOnline,
//         getUserLastSeen,
//         getFormattedLastSeen
//     };
// }

// // components/OnlineIndicator.tsx
// import React from 'react';
// import { motion } from 'framer-motion';

// interface OnlineIndicatorProps {
//     isOnline: boolean;
//     size?: 'sm' | 'md' | 'lg';
//     showText?: boolean;
//     lastSeen?: string;
//     isDarkMode?: boolean;
// }

// export function OnlineIndicator({ 
//     isOnline, 
//     size = 'md', 
//     showText = true, 
//     lastSeen,
//     isDarkMode = false 
// }: OnlineIndicatorProps) {
//     const sizeClasses = {
//         sm: 'w-3 h-3',
//         md: 'w-4 h-4',
//         lg: 'w-5 h-5'
//     };

//     const textSizeClasses = {
//         sm: 'text-xs',
//         md: 'text-sm',
//         lg: 'text-base'
//     };

//     return (
//         <div className="flex items-center space-x-2">
//             <motion.div
//                 className={`rounded-full border-2 ${
//                     isOnline ? 'bg-green-500 border-green-400' : 'bg-gray-400 border-gray-300'
//                 } ${sizeClasses[size]} ${
//                     isDarkMode ? 'border-gray-700' : 'border-white'
//                 }`}
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ duration: 0.3 }}
//             >
//                 {isOnline && (
//                     <motion.div
//                         className="w-full h-full bg-green-400 rounded-full"
//                         animate={{ opacity: [1, 0.5, 1] }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                     />
//                 )}
//             </motion.div>
            
//             {showText && (
//                 <span className={`font-medium ${textSizeClasses[size]} ${
//                     isOnline 
//                         ? 'text-green-500' 
//                         : isDarkMode ? 'text-gray-400' : 'text-gray-500'
//                 }`}>
//                     {isOnline ? '🟢 Đang hoạt động' : `⚫ ${lastSeen || 'Ngoại tuyến'}`}
//                 </span>
//             )}
//         </div>
//     );
// }

// // Cập nhật ChatHeader.tsx
// import React from 'react';
// import { Phone, Video, MoreVertical, User } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { motion } from 'framer-motion';
// import { useOnlineStatus } from '@/hooks/useOnlineStatus';
// import { OnlineIndicator } from '@/components/OnlineIndicator';
// import type { UserProfile } from '@/app/types';

// interface ChatHeaderProps {
//     user: UserProfile;
//     onAudioCall: () => void;
//     onVideoCall?: () => void;
//     onViewProfile?: () => void;
//     onToggleDetails?: () => void;
//     isDetailsOpen?: boolean;
//     isDarkMode?: boolean;
// }

// export function ChatHeader({ 
//     user, 
//     onAudioCall, 
//     onVideoCall, 
//     onViewProfile, 
//     onToggleDetails, 
//     isDetailsOpen = false,
//     isDarkMode = false 
// }: ChatHeaderProps) {
//     const { isUserOnline, getFormattedLastSeen } = useOnlineStatus();
//     const userIsOnline = isUserOnline(user.id);
//     const lastSeen = getFormattedLastSeen(user.id);

//     return (
//         <div className={`flex items-center justify-between p-4 border-b transition-colors duration-300 ${
//             isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//         }`}>
//             <div className="flex items-center space-x-3">
//                 <motion.button
//                     onClick={onViewProfile}
//                     className="relative group"
//                     whileHover={{ scale: 1.05 }}
//                     transition={{ duration: 0.2 }}
//                 >
//                     <img
//                         src={user.avatar}
//                         alt={user.name}
//                         className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-cyan-400 transition-all duration-200"
//                     />
//                     {/* Online indicator */}
//                     <div className="absolute -bottom-1 -right-1">
//                         <OnlineIndicator 
//                             isOnline={userIsOnline} 
//                             size="sm" 
//                             showText={false}
//                             isDarkMode={isDarkMode}
//                         />
//                     </div>
//                 </motion.button>
                
//                 <div>
//                     <motion.button
//                         onClick={onViewProfile}
//                         className={`font-semibold hover:text-cyan-500 transition-colors duration-200 ${
//                             isDarkMode ? 'text-white' : 'text-gray-900'
//                         }`}
//                         whileHover={{ scale: 1.02 }}
//                         transition={{ duration: 0.2 }}
//                     >
//                         {user.name}
//                     </motion.button>
                    
//                     <OnlineIndicator 
//                         isOnline={userIsOnline}
//                         size="sm"
//                         lastSeen={lastSeen}
//                         isDarkMode={isDarkMode}
//                     />
//                 </div>
//             </div>
            
//             <div className="flex items-center space-x-2">
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={onAudioCall}
//                         className={`transition-colors duration-200 ${
//                             isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
//                         }`}
//                         title="Gọi thoại"
//                     >
//                         <Phone className="h-5 w-5" />
//                     </Button>
//                 </motion.div>
                
//                 {onVideoCall && (
//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={onVideoCall}
//                             className={`transition-colors duration-200 ${
//                                 isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
//                             }`}
//                             title="Gọi video"
//                         >
//                             <Video className="h-5 w-5" />
//                         </Button>
//                     </motion.div>
//                 )}
                
//                 {onToggleDetails && (
//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={onToggleDetails}
//                             className={`transition-colors duration-200 ${
//                                 isDetailsOpen 
//                                     ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400' 
//                                     : isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
//                             }`}
//                             title="Thông tin chi tiết"
//                         >
//                             <User className="h-5 w-5" />
//                         </Button>
//                     </motion.div>
//                 )}
//             </div>
//         </div>
//     );
// }
