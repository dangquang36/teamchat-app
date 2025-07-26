const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 3000;

const userSocketMap = {};
const activeRooms = {}; // Theo dõi các room đang hoạt động

nextApp.prepare().then(() => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Lắng nghe kết nối Socket.IO
    io.on('connection', (socket) => {
        console.log(`✅ Client đã kết nối: ${socket.id}`);

        // Đăng ký user
        socket.on('join', (userId) => {
            userSocketMap[userId] = socket.id;
            console.log(`👤 User ${userId} joined with socket ${socket.id}`);
        });

        socket.on('privateMessage', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', payload);
                console.log(`💬 Message sent from ${socket.id} to ${recipientId}`);
            }
        });

        socket.on('sendFriendRequest', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('friendRequestReceived', payload);
                console.log(`👥 Friend request sent to ${recipientId}`);
            }
        });

        socket.on('acceptFriendRequest', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('friendRequestAccepted', payload);
                console.log(`✅ Friend request accepted by ${recipientId}`);
            }
        });

        // Khởi tạo cuộc gọi
        socket.on('initiateCall', ({ receiverId, callData }) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                // Lưu thông tin room
                activeRooms[callData.roomName] = {
                    callerId: callData.callerId,
                    receiverId: receiverId,
                    status: 'calling',
                    createdAt: Date.now(),
                    callerSocketId: socket.id,
                    receiverSocketId: receiverSocketId
                };

                // Gửi cuộc gọi đến cho receiver
                io.to(receiverSocketId).emit('incomingCall', callData);
                console.log(`📞 Call initiated from ${callData.callerId} to ${receiverId} in room ${callData.roomName}`);

                // Gửi notification
                io.to(receiverSocketId).emit('incomingCallNotification', callData);

                // Gửi status cho caller
                socket.emit('callStatusChange', {
                    type: 'calling',
                    message: 'Đang gọi...'
                });

                // Set timeout để tự động hủy cuộc gọi sau 30 giây nếu không được trả lời
                setTimeout(() => {
                    if (activeRooms[callData.roomName] && activeRooms[callData.roomName].status === 'calling') {
                        // Thông báo timeout
                        socket.emit('callStatusChange', {
                            type: 'timeout',
                            message: 'Không có phản hồi'
                        });

                        io.to(receiverSocketId).emit('callStatusChange', {
                            type: 'timeout',
                            message: 'Cuộc gọi đã hết thời gian'
                        });

                        // Cleanup
                        delete activeRooms[callData.roomName];
                        console.log(`⏰ Call timeout: ${callData.roomName}`);
                    }
                }, 30000); // 30 seconds

            } else {
                socket.emit('callStatusChange', {
                    type: 'error',
                    message: 'Người dùng không trực tuyến'
                });
                console.log(`❌ Call failed: User ${receiverId} is offline`);
            }
        });

        // Chấp nhận cuộc gọi
        socket.on('acceptCall', ({ callerId, callData }) => {
            const callerSocketId = userSocketMap[callerId];
            if (callerSocketId) {
                // Cập nhật trạng thái room
                if (activeRooms[callData.roomName]) {
                    activeRooms[callData.roomName].status = 'connecting';
                    console.log(`🔄 Room ${callData.roomName} status: connecting`);
                }

                // Thông báo cho caller rằng cuộc gọi được chấp nhận
                io.to(callerSocketId).emit('callAccepted', callData);
                console.log(`✅ Call accepted by ${callData.receiverId}`);

                // Gửi status connecting cho cả hai
                socket.emit('callStatusChange', {
                    type: 'connecting',
                    message: 'Đang kết nối...'
                });
                io.to(callerSocketId).emit('callStatusChange', {
                    type: 'connecting',
                    message: 'Đang kết nối...'
                });

                // Thông báo rằng cuộc gọi đã được chấp nhận và đang kết nối
                io.to(callerSocketId).emit('callConnecting', {
                    roomName: callData.roomName,
                    participants: [callerId, callData.receiverId]
                });
                socket.emit('callConnecting', {
                    roomName: callData.roomName,
                    participants: [callerId, callData.receiverId]
                });

                // Sau 3 giây, update status thành connected nếu room vẫn tồn tại
                setTimeout(() => {
                    if (activeRooms[callData.roomName] && activeRooms[callData.roomName].status === 'connecting') {
                        activeRooms[callData.roomName].status = 'connected';

                        // Gửi status connected cho cả hai
                        socket.emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối'
                        });
                        io.to(callerSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối'
                        });

                        // Thông báo cuộc gọi đã bắt đầu
                        io.to(callerSocketId).emit('callStarted', {
                            roomName: callData.roomName,
                            participants: [callerId, callData.receiverId]
                        });
                        socket.emit('callStarted', {
                            roomName: callData.roomName,
                            participants: [callerId, callData.receiverId]
                        });

                        console.log(`🎉 Call started successfully: ${callData.roomName}`);
                    }
                }, 3000);
            }
        });

        // Từ chối cuộc gọi
        socket.on('rejectCall', ({ callerId, reason }) => {
            const callerSocketId = userSocketMap[callerId];
            if (callerSocketId) {
                const messages = {
                    busy: 'Người dùng đang bận',
                    declined: 'Cuộc gọi bị từ chối',
                    unavailable: 'Không thể kết nối'
                };

                // Cleanup room
                Object.keys(activeRooms).forEach(roomName => {
                    const room = activeRooms[roomName];
                    if (room.callerId === callerId) {
                        console.log(`🗑️ Cleaning up rejected room: ${roomName}`);
                        delete activeRooms[roomName];
                    }
                });

                // Thông báo cho caller
                io.to(callerSocketId).emit('callRejected', {
                    reason,
                    message: messages[reason] || messages.declined
                });

                // Send status change notification
                io.to(callerSocketId).emit('callStatusChange', {
                    type: 'rejected',
                    message: messages[reason] || messages.declined
                });

                console.log(`❌ Call rejected by receiver, reason: ${reason}`);
            }
        });

        // Báo cáo trạng thái kết nối LiveKit
        socket.on('livekitConnected', ({ roomName, userId }) => {
            console.log(`🔗 LiveKit connected: ${userId} in room ${roomName}`);

            if (activeRooms[roomName]) {
                const room = activeRooms[roomName];

                // Nếu cả hai đã kết nối LiveKit
                if (!room.callerLivekitConnected && room.callerId === userId) {
                    room.callerLivekitConnected = true;
                } else if (!room.receiverLivekitConnected && room.receiverId === userId) {
                    room.receiverLivekitConnected = true;
                }

                // Nếu cả hai đã kết nối, update status
                if (room.callerLivekitConnected && room.receiverLivekitConnected) {
                    room.status = 'connected';

                    // Thông báo cho cả hai
                    if (room.callerSocketId) {
                        io.to(room.callerSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối'
                        });
                    }
                    if (room.receiverSocketId) {
                        io.to(room.receiverSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối'
                        });
                    }

                    console.log(`🎉 Both participants connected to LiveKit: ${roomName}`);
                }
            }
        });

        // Kết thúc cuộc gọi
        socket.on('endCall', ({ targetUserId, callData, userId }) => {
            console.log(`📞 Call end request from ${userId}`);

            // Tìm và thông báo cho tất cả participants
            let targetSockets = [];

            if (targetUserId) {
                const targetSocketId = userSocketMap[targetUserId];
                if (targetSocketId) {
                    targetSockets.push(targetSocketId);
                }
            }

            // Cleanup active rooms
            Object.keys(activeRooms).forEach(roomName => {
                const room = activeRooms[roomName];
                if (room.callerId === userId || room.receiverId === userId) {
                    // Thông báo cho cả hai participants
                    const callerSocket = userSocketMap[room.callerId];
                    const receiverSocket = userSocketMap[room.receiverId];

                    if (callerSocket && callerSocket !== socket.id) {
                        io.to(callerSocket).emit('callEnded', {
                            endedBy: userId,
                            roomName: roomName
                        });
                        io.to(callerSocket).emit('callStatusChange', { type: 'ended' });
                    }

                    if (receiverSocket && receiverSocket !== socket.id) {
                        io.to(receiverSocket).emit('callEnded', {
                            endedBy: userId,
                            roomName: roomName
                        });
                        io.to(receiverSocket).emit('callStatusChange', { type: 'ended' });
                    }

                    delete activeRooms[roomName];
                    console.log(`🗑️ Cleaned up room: ${roomName}`);
                }
            });

            // Gửi cho target user cụ thể nếu có
            targetSockets.forEach(socketId => {
                io.to(socketId).emit('callEnded', callData || { endedBy: userId });
                io.to(socketId).emit('callStatusChange', { type: 'ended' });
            });

            console.log(`📞 Call ended by ${userId}`);
        });

        // User status events
        socket.on('userOnline', ({ userId, userInfo }) => {
            userSocketMap[userId] = socket.id;
            console.log(`🟢 User ${userId} is online:`, userInfo.name);

            // Broadcast to other users that this user is online
            socket.broadcast.emit('userStatusChanged', {
                userId,
                status: 'online',
                userInfo
            });
        });

        // Disconnect event
        socket.on('disconnect', () => {
            let disconnectedUserId = null;
            for (const userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) {
                    disconnectedUserId = userId;
                    delete userSocketMap[userId];
                    break;
                }
            }

            if (disconnectedUserId) {
                console.log(`🔴 User ${disconnectedUserId} disconnected`);

                // Cleanup active rooms và thông báo call ended
                Object.keys(activeRooms).forEach(roomName => {
                    const room = activeRooms[roomName];
                    if (room.callerId === disconnectedUserId || room.receiverId === disconnectedUserId) {
                        const otherUserId = room.callerId === disconnectedUserId ? room.receiverId : room.callerId;
                        const otherSocket = userSocketMap[otherUserId];

                        if (otherSocket) {
                            io.to(otherSocket).emit('callEnded', {
                                endedBy: disconnectedUserId,
                                reason: 'disconnect',
                                roomName: roomName
                            });
                            io.to(otherSocket).emit('callStatusChange', {
                                type: 'ended',
                                message: 'Người dùng đã ngắt kết nối'
                            });
                        }

                        delete activeRooms[roomName];
                        console.log(`🗑️ Cleaned up room due to disconnect: ${roomName}`);
                    }
                });

                socket.broadcast.emit('userStatusChanged', {
                    userId: disconnectedUserId,
                    status: 'offline'
                });
            }

            console.log(`❌ Client disconnected: ${socket.id}`);
        });

        // Heartbeat để theo dõi kết nối
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    app.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 Server ready on http://localhost:${port}`);
        console.log(`📞 Call system initialized`);
        console.log(`💬 Chat system ready`);

        // Cleanup inactive rooms mỗi 5 phút
        setInterval(() => {
            const now = Date.now();
            Object.keys(activeRooms).forEach(roomName => {
                const room = activeRooms[roomName];
                // Cleanup rooms older than 5 minutes or stuck in calling state for more than 1 minute
                if (now - room.createdAt > 5 * 60 * 1000 ||
                    (room.status === 'calling' && now - room.createdAt > 60 * 1000)) {
                    console.log(`🗑️ Cleaning up inactive/stuck room: ${roomName} (${room.status})`);
                    delete activeRooms[roomName];
                }
            });
        }, 60 * 1000); // Check every minute
    });
});