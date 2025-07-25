// server.js (Bản sửa lỗi cuối cùng - Dùng phương pháp thay thế)

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

nextApp.prepare().then(() => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Lắng nghe kết nối Socket.IO (Không thay đổi)
    io.on('connection', (socket) => {
        console.log(`✅ Client đã kết nối: ${socket.id}`);
        socket.on('join', (userId) => { userSocketMap[userId] = socket.id; });
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
        socket.on('disconnect', () => {
            for (const userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) { delete userSocketMap[userId]; break; }
            }
        });
    });

    // === PHƯƠNG PHÁP THAY THẾ ===
    // Giao tất cả các request khác cho Next.js xử lý
    app.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Sẵn sàng trên http://localhost:${port}`);
    });
});