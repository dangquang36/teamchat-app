

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = process.env.PORT || 3000;

const userSocketMap = {};

nextApp.prepare().then(() => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ Client đã kết nối: ${socket.id}`);

        const userId = socket.handshake.query.userId;
        if (userId) {
            console.log(`User ${userId} đã join với socket id ${socket.id}`);
            userSocketMap[userId] = socket.id;
        }

        // --- Các sự kiện cũ (giữ nguyên) ---
        socket.on('privateMessage', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) { io.to(recipientSocketId).emit('newMessage', payload); }
        });
        socket.on('sendFriendRequest', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) { io.to(recipientSocketId).emit('friendRequestReceived', payload); }
        });
        socket.on('acceptFriendRequest', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) { io.to(recipientSocketId).emit('friendRequestAccepted', payload); }
        });

        // 1. Khi User A gửi lời mời gọi đến User B
        socket.on('client:outgoing-call', ({ to, caller, roomName }) => {
            const recipientSocketId = userSocketMap[to];
            if (recipientSocketId) {
                console.log(`📞 Chuyển tiếp cuộc gọi từ ${caller.name} (socket: ${socket.id}) đến user ${to} (socket: ${recipientSocketId})`);
                io.to(recipientSocketId).emit('server:incoming-call', { caller, roomName });
            } else {
                console.log(`❌ Không tìm thấy user ${to} để gửi lời mời.`);
                // (Tùy chọn) Gửi lại thông báo cho người gọi là người nhận offline
                socket.emit('server:recipient-offline');
            }
        });

        // 2. Khi User B chấp nhận cuộc gọi
        socket.on('client:call-accepted', ({ to, roomName }) => {
            const callerSocketId = userSocketMap[to];
            if (callerSocketId) {
                console.log(`✅ Cuộc gọi được chấp nhận, báo cho người gọi gốc ${to} tại socket ${callerSocketId}`);
                io.to(callerSocketId).emit('server:call-accepted', { roomName });
            }
        });

        // 3. Khi User B từ chối cuộc gọi
        socket.on('client:call-declined', ({ to, fromName }) => {
            const callerSocketId = userSocketMap[to];
            if (callerSocketId) {
                console.log(`❌ Cuộc gọi bị từ chối, báo cho người gọi gốc ${to}`);
                io.to(callerSocketId).emit('server:call-declined', { fromName });
            }
        });

        // 4. Khi một trong hai người kết thúc cuộc gọi
        socket.on('client:call-ended', ({ to }) => {
            const otherPersonSocketId = userSocketMap[to];
            if (otherPersonSocketId) {
                io.to(otherPersonSocketId).emit('server:call-ended');
            }
        });
        socket.on('disconnect', () => {
            console.log(`❌ Client đã ngắt kết nối: ${socket.id}`);
            // Xóa user khỏi map khi họ disconnect
            for (const uid in userSocketMap) {
                if (userSocketMap[uid] === socket.id) {
                    delete userSocketMap[uid];
                    console.log(`User ${uid} đã được xóa khỏi userSocketMap.`);
                    break;
                }
            }
        });
    });

    app.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Sẵn sàng trên http://localhost:${port}`);
    });
});
