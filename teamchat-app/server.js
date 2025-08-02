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
const activeRooms = {};

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
            console.log(`📊 Current user map:`, userSocketMap);
        });

        socket.on('privateMessage', ({ recipientId, payload }) => {
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', payload);
                console.log(`💬 Message sent from ${socket.id} to ${recipientId}`);
            }
        });

        // Direct message emoji reaction events
        socket.on('directMessageEmojiReaction', ({ recipientId, chatId, messageId, emoji, userId, userName, timestamp }) => {
            console.log(`📥 SERVER RECEIVED EMOJI: recipientId=${recipientId}, chatId=${chatId}, messageId=${messageId}, emoji=${emoji}, userId=${userId}`);

            console.log(`🔍 User socket map status:`, Object.keys(userSocketMap));
            console.log(`🔍 Looking for recipient ${recipientId} in map...`);

            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                console.log(`✅ Found recipient socket: ${recipientSocketId}`);
                io.to(recipientSocketId).emit('directMessageEmojiReaction', {
                    chatId,
                    messageId,
                    emoji,
                    userId,
                    userName,
                    timestamp
                });
                console.log(`📤 Direct message emoji reaction sent to ${recipientId} (socket: ${recipientSocketId}) for chat ${chatId}`);
            } else {
                console.log(`❌ Recipient ${recipientId} not found in userSocketMap:`, userSocketMap);
                console.log(`❌ Available users:`, Object.keys(userSocketMap));
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

        // Khởi tạo cuộc gọi (Enhanced với callType)
        socket.on('initiateCall', ({ receiverId, callData }) => {
            const receiverSocketId = userSocketMap[receiverId];
            if (receiverSocketId) {
                // Validate callType
                const callType = callData.callType || 'video';
                const validCallTypes = ['audio', 'video'];

                if (!validCallTypes.includes(callType)) {
                    socket.emit('callStatusChange', {
                        type: 'error',
                        message: 'Loại cuộc gọi không hợp lệ'
                    });
                    return;
                }

                // Lưu thông tin room với callType
                activeRooms[callData.roomName] = {
                    callerId: callData.callerId,
                    receiverId: receiverId,
                    callType: callType,
                    status: 'calling',
                    createdAt: Date.now(),
                    callerSocketId: socket.id,
                    receiverSocketId: receiverSocketId
                };

                // Gửi cuộc gọi đến cho receiver với thông tin callType
                io.to(receiverSocketId).emit('incomingCall', {
                    ...callData,
                    callType: callType
                });

                console.log(`📞 ${callType} call initiated from ${callData.callerId} to ${receiverId} in room ${callData.roomName}`);

                // Gửi notification với loại cuộc gọi
                io.to(receiverSocketId).emit('incomingCallNotification', {
                    ...callData,
                    callType: callType
                });

                // Gửi status cho caller
                socket.emit('callStatusChange', {
                    type: 'calling',
                    message: `Đang gọi ${callType === 'audio' ? 'thoại' : 'video'}...`,
                    callType: callType
                });

                // Set timeout để tự động hủy cuộc gọi sau 30 giây nếu không được trả lời
                setTimeout(() => {
                    if (activeRooms[callData.roomName] && activeRooms[callData.roomName].status === 'calling') {
                        // Thông báo timeout với callType
                        socket.emit('callStatusChange', {
                            type: 'timeout',
                            message: 'Không có phản hồi',
                            callType: callType
                        });

                        io.to(receiverSocketId).emit('callStatusChange', {
                            type: 'timeout',
                            message: 'Cuộc gọi đã hết thời gian',
                            callType: callType
                        });

                        // Cleanup
                        delete activeRooms[callData.roomName];
                        console.log(`⏰ ${callType} call timeout: ${callData.roomName}`);
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

        // Chấp nhận cuộc gọi (Enhanced với callType)
        socket.on('acceptCall', ({ callerId, callData }) => {
            const callerSocketId = userSocketMap[callerId];
            if (callerSocketId) {
                const callType = callData.callType || 'video';

                // Cập nhật trạng thái room
                if (activeRooms[callData.roomName]) {
                    activeRooms[callData.roomName].status = 'connecting';
                    activeRooms[callData.roomName].callType = callType;
                    console.log(`🔄 Room ${callData.roomName} status: connecting (${callType})`);
                }

                // Thông báo cho caller rằng cuộc gọi được chấp nhận
                io.to(callerSocketId).emit('callAccepted', {
                    ...callData,
                    callType: callType
                });

                console.log(`✅ ${callType} call accepted by ${callData.receiverId}`);

                // Gửi status connecting cho cả hai
                socket.emit('callStatusChange', {
                    type: 'connecting',
                    message: 'Đang kết nối...',
                    callType: callType
                });
                io.to(callerSocketId).emit('callStatusChange', {
                    type: 'connecting',
                    message: 'Đang kết nối...',
                    callType: callType
                });

                // Thông báo rằng cuộc gọi đã được chấp nhận và đang kết nối
                io.to(callerSocketId).emit('callConnecting', {
                    roomName: callData.roomName,
                    participants: [callerId, callData.receiverId],
                    callType: callType
                });
                socket.emit('callConnecting', {
                    roomName: callData.roomName,
                    participants: [callerId, callData.receiverId],
                    callType: callType
                });

                // Sau 3 giây, update status thành connected nếu room vẫn tồn tại
                setTimeout(() => {
                    if (activeRooms[callData.roomName] && activeRooms[callData.roomName].status === 'connecting') {
                        activeRooms[callData.roomName].status = 'connected';

                        // Gửi status connected cho cả hai
                        socket.emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối',
                            callType: callType
                        });
                        io.to(callerSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối',
                            callType: callType
                        });

                        // Thông báo cuộc gọi đã bắt đầu
                        io.to(callerSocketId).emit('callStarted', {
                            roomName: callData.roomName,
                            participants: [callerId, callData.receiverId],
                            callType: callType
                        });
                        socket.emit('callStarted', {
                            roomName: callData.roomName,
                            participants: [callerId, callData.receiverId],
                            callType: callType
                        });

                        console.log(`🎉 ${callType} call started successfully: ${callData.roomName}`);
                    }
                }, 3000);
            }
        });

        // Từ chối cuộc gọi (Enhanced với callType)
        socket.on('rejectCall', ({ callerId, reason }) => {
            const callerSocketId = userSocketMap[callerId];
            if (callerSocketId) {
                const messages = {
                    busy: 'Người dùng đang bận',
                    declined: 'Cuộc gọi bị từ chối',
                    unavailable: 'Không thể kết nối'
                };

                let callType = 'video'; // default

                // Cleanup room và lấy callType
                Object.keys(activeRooms).forEach(roomName => {
                    const room = activeRooms[roomName];
                    if (room.callerId === callerId) {
                        callType = room.callType || 'video';
                        console.log(`🗑️ Cleaning up rejected ${callType} room: ${roomName}`);
                        delete activeRooms[roomName];
                    }
                });

                // Thông báo cho caller với callType
                io.to(callerSocketId).emit('callRejected', {
                    reason,
                    message: messages[reason] || messages.declined,
                    callType: callType
                });

                // Send status change notification với callType
                io.to(callerSocketId).emit('callStatusChange', {
                    type: 'rejected',
                    message: messages[reason] || messages.declined,
                    callType: callType
                });

                console.log(`❌ ${callType} call rejected by receiver, reason: ${reason}`);
            }
        });

        // Báo cáo trạng thái kết nối LiveKit (Enhanced với callType)
        socket.on('livekitConnected', ({ roomName, userId }) => {
            console.log(`🔗 LiveKit connected: ${userId} in room ${roomName}`);

            if (activeRooms[roomName]) {
                const room = activeRooms[roomName];
                const callType = room.callType || 'video';

                // Nếu cả hai đã kết nối LiveKit
                if (!room.callerLivekitConnected && room.callerId === userId) {
                    room.callerLivekitConnected = true;
                } else if (!room.receiverLivekitConnected && room.receiverId === userId) {
                    room.receiverLivekitConnected = true;
                }

                // Nếu cả hai đã kết nối, update status
                if (room.callerLivekitConnected && room.receiverLivekitConnected) {
                    room.status = 'connected';

                    // Thông báo cho cả hai với callType
                    if (room.callerSocketId) {
                        io.to(room.callerSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối',
                            callType: callType
                        });
                    }
                    if (room.receiverSocketId) {
                        io.to(room.receiverSocketId).emit('callStatusChange', {
                            type: 'connected',
                            message: 'Đã kết nối',
                            callType: callType
                        });
                    }

                    console.log(`🎉 Both participants connected to LiveKit: ${roomName} (${callType})`);
                }
            }
        });

        // Kết thúc cuộc gọi (Enhanced với callType)
        socket.on('endCall', ({ targetUserId, callData, userId }) => {
            console.log(`📞 Call end request from ${userId}`);

            // Tìm và thông báo cho tất cả participants
            let targetSockets = [];
            let callType = 'video'; // default

            if (targetUserId) {
                const targetSocketId = userSocketMap[targetUserId];
                if (targetSocketId) {
                    targetSockets.push(targetSocketId);
                }
            }

            // Cleanup active rooms và lấy callType
            Object.keys(activeRooms).forEach(roomName => {
                const room = activeRooms[roomName];
                if (room.callerId === userId || room.receiverId === userId) {
                    callType = room.callType || 'video';

                    // Thông báo cho cả hai participants
                    const callerSocket = userSocketMap[room.callerId];
                    const receiverSocket = userSocketMap[room.receiverId];

                    if (callerSocket && callerSocket !== socket.id) {
                        io.to(callerSocket).emit('callEnded', {
                            endedBy: userId,
                            roomName: roomName,
                            callType: callType
                        });
                        io.to(callerSocket).emit('callStatusChange', {
                            type: 'ended',
                            callType: callType
                        });
                    }

                    if (receiverSocket && receiverSocket !== socket.id) {
                        io.to(receiverSocket).emit('callEnded', {
                            endedBy: userId,
                            roomName: roomName,
                            callType: callType
                        });
                        io.to(receiverSocket).emit('callStatusChange', {
                            type: 'ended',
                            callType: callType
                        });
                    }

                    delete activeRooms[roomName];
                    console.log(`🗑️ Cleaned up ${callType} room: ${roomName}`);
                }
            });

            // Gửi cho target user cụ thể nếu có
            targetSockets.forEach(socketId => {
                io.to(socketId).emit('callEnded', {
                    ...(callData || { endedBy: userId }),
                    callType: callType
                });
                io.to(socketId).emit('callStatusChange', {
                    type: 'ended',
                    callType: callType
                });
            });

            console.log(`📞 ${callType} call ended by ${userId}`);
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

        // Disconnect event (Enhanced với callType cleanup)
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

                // Cleanup active rooms và thông báo call ended với callType
                Object.keys(activeRooms).forEach(roomName => {
                    const room = activeRooms[roomName];
                    if (room.callerId === disconnectedUserId || room.receiverId === disconnectedUserId) {
                        const otherUserId = room.callerId === disconnectedUserId ? room.receiverId : room.callerId;
                        const otherSocket = userSocketMap[otherUserId];
                        const callType = room.callType || 'video';

                        if (otherSocket) {
                            io.to(otherSocket).emit('callEnded', {
                                endedBy: disconnectedUserId,
                                reason: 'disconnect',
                                roomName: roomName,
                                callType: callType
                            });
                            io.to(otherSocket).emit('callStatusChange', {
                                type: 'ended',
                                message: 'Người dùng đã ngắt kết nối',
                                callType: callType
                            });
                        }

                        delete activeRooms[roomName];
                        console.log(`🗑️ Cleaned up ${callType} room due to disconnect: ${roomName}`);
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

        // Enhanced call quality reporting
        socket.on('callQualityReport', ({ roomName, userId, qualityData }) => {
            console.log(`📊 Call quality report from ${userId} in room ${roomName}:`, qualityData);

            if (activeRooms[roomName]) {
                const room = activeRooms[roomName];
                const callType = room.callType || 'video';

                // Forward quality data to other participant
                const otherUserId = room.callerId === userId ? room.receiverId : room.callerId;
                const otherSocket = userSocketMap[otherUserId];

                if (otherSocket) {
                    io.to(otherSocket).emit('callQualityUpdate', {
                        fromUser: userId,
                        qualityData: qualityData,
                        callType: callType
                    });
                }
            }
        });

        // Call statistics tracking
        socket.on('callStats', ({ roomName, userId, stats }) => {
            if (activeRooms[roomName]) {
                const room = activeRooms[roomName];
                const callType = room.callType || 'video';

                // Store or process call statistics
                console.log(`📈 Call stats from ${userId} (${callType}):`, {
                    room: roomName,
                    type: callType,
                    stats: stats
                });
            }
        });

        // Channel invitation events
        socket.on('sendChannelInvitation', ({ recipientId, payload }) => {
            console.log(`🔔 Sending channel invitation to ${recipientId}:`, payload);
            const recipientSocketId = userSocketMap[recipientId];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('channelInvitationReceived', payload);
                console.log(`✅ Channel invitation sent successfully to ${recipientId} (socket: ${recipientSocketId})`);
            } else {
                console.log(`❌ Recipient ${recipientId} not found or not connected`);
            }
        });

        socket.on('acceptChannelInvitation', ({ inviterId, payload }) => {
            console.log(`✅ Channel invitation accepted by ${payload.inviteeName} for channel ${payload.channelId}`);
            console.log('📋 Server received payload:', payload);

            // Notify inviter
            const inviterSocketId = userSocketMap[inviterId];
            if (inviterSocketId) {
                io.to(inviterSocketId).emit('channelInvitationAccepted', payload);
                console.log(`📤 Notified inviter ${inviterId}`);
            }

            const newMemberData = {
                id: payload.inviteeId,
                name: payload.inviteeName,
                avatar: payload.inviteeAvatar,
                status: 'online',
                joinedAt: new Date()
            };

            console.log('👤 Broadcasting new member data:', newMemberData);

            // Broadcast to all users in the channel (for real-time member updates)
            io.emit('channelMemberJoined', {
                channelId: payload.channelId,
                newMember: newMemberData,
                channelData: {
                    name: payload.channelName,
                    image: payload.channelImage // Include channel image for sync
                }
            });
            console.log(`📢 Broadcast member joined to all users in channel ${payload.channelId}`);
        });

        socket.on('declineChannelInvitation', ({ inviterId, payload }) => {
            const inviterSocketId = userSocketMap[inviterId];
            if (inviterSocketId) {
                io.to(inviterSocketId).emit('channelInvitationDeclined', payload);
                console.log(`❌ Channel invitation declined by ${payload.inviteeName}`);
            }
        });



        // Test simple event handler
        socket.on('testSimple', (data, callback) => {
            console.log('🧪 SERVER: Received testSimple event:', data);
            if (callback && typeof callback === 'function') {
                callback({ success: true, message: 'Simple test worked!' });
                console.log('🧪 SERVER: Sent simple test response');
            }
        });

        // Handle channel info updates
        socket.on('updateChannelInfo', (payload, callback) => {
            console.log('🔄 SERVER: Channel update received!');
            console.log('📊 SERVER: Payload:', JSON.stringify(payload, null, 2));
            console.log(`📊 SERVER: Channel ID: ${payload?.channelId}`);
            console.log(`📊 SERVER: Updated by: ${payload?.updatedBy?.name}`);
            console.log(`📊 SERVER: Updates:`, payload?.updates);

            const broadcastPayload = {
                channelId: payload.channelId,
                updates: payload.updates,
                updatedBy: payload.updatedBy
            };

            console.log('📢 SERVER: Broadcasting to all clients...');
            // Broadcast to all users (they will filter by channelId)
            io.emit('channelInfoUpdated', broadcastPayload);
            console.log(`📢 SERVER: Broadcast complete to ${io.engine.clientsCount} clients`);

            // Send acknowledgment back to client
            if (callback && typeof callback === 'function') {
                callback({ success: true, message: 'Channel update broadcasted successfully' });
                console.log('📝 SERVER: Sent acknowledgment to client');
            } else {
                console.log('📝 SERVER: No callback provided');
            }
        });

        // Debug: Log all events received by this socket
        socket.onAny((eventName, ...args) => {
            console.log(`🎯 SERVER: Socket ${socket.id} received event: "${eventName}"`);
            if (eventName === 'updateChannelInfo') {
                console.log(`🎯 SERVER: updateChannelInfo args:`, args);
            }
        });

        // Meeting notification to channel members
        socket.on('notifyChannelMeeting', ({ channelId, meetingData }) => {
            console.log(`📢 Meeting notification sent to channel ${channelId}`);
            // Broadcast to all connected users (in a real app, you'd get channel members from database)
            io.emit('meetingNotificationReceived', {
                ...meetingData,
                channelId
            });
        });

        // Channel message events
        socket.on('sendChannelMessage', ({ channelId, message, senderId }) => {
            console.log(`💬 Channel message sent to ${channelId} by ${senderId}`);
            console.log(`📎 Message type: ${message.type}`);
            console.log(`📁 Has file data: ${!!message.fileData}`);

            if (message.fileData) {
                console.log(`📋 File info: ${message.fileData.name} (${message.fileData.size} bytes)`);
            }

            // Special handling for poll messages
            if (message.type === 'poll' && message.poll) {
                console.log(`📊 Poll message details:`, {
                    pollId: message.poll.id,
                    question: message.poll.question,
                    options: message.poll.options.map(opt => ({ id: opt.id, text: opt.text })),
                    creator: message.poll.createdByName
                });
            }

            console.log(`📤 Broadcasting to all users EXCEPT sender ${senderId}`);

            // Broadcast to all channel members EXCEPT the sender
            socket.broadcast.emit('channelMessageReceived', { channelId, message });
            console.log(`✅ Message broadcasted to channel ${channelId}`);
        });

        // Channel emoji reaction events
        socket.on('channelEmojiReaction', ({ channelId, messageId, emoji, userId, userName, timestamp }) => {
            console.log(`😀 Emoji reaction: ${emoji} added to message ${messageId} in channel ${channelId} by ${userName} (${userId})`);

            // Broadcast to all channel members EXCEPT the sender
            socket.broadcast.emit('channelEmojiReaction', {
                channelId,
                messageId,
                emoji,
                userId,
                userName,
                timestamp
            });

            console.log(`✅ Emoji reaction broadcasted to channel ${channelId}`);
        });

        // Poll vote notification events
        socket.on('pollVoted', (payload) => {
            console.log(`🗳️ [Server] Poll vote notification for channel ${payload.channelId}`);
            console.log(`👤 [Server] Voter: ${payload.voter.name} ${payload.action || 'voted'} for "${payload.optionText}"`);
            console.log(`📊 [Server] Poll: "${payload.pollQuestion}"`);

            // Validate payload
            if (!payload.channelId || !payload.voter || !payload.pollQuestion) {
                console.error(`❌ [Server] Invalid poll vote payload:`, payload);
                return;
            }

            console.log(`📤 [Server] Broadcasting vote notification to all users EXCEPT voter ${payload.voter.id}`);

            // Broadcast vote notification to all channel members EXCEPT the voter
            socket.broadcast.emit('pollVoted', {
                ...payload,
                timestamp: new Date(),
                serverProcessedAt: Date.now()
            });
            console.log(`✅ [Server] Poll vote notification broadcasted to channel ${payload.channelId}`);
        });

        // Poll data update events  
        socket.on('pollUpdated', (payload) => {
            console.log(`📊 [Server] Poll data update for channel ${payload.channelId}`);
            console.log(`🔄 [Server] Poll ID: ${payload.updatedPoll.id}`);
            console.log(`📈 [Server] Total voters: ${payload.updatedPoll.totalVoters}`);
            console.log(`🔗 [Server] Message ID: ${payload.messageId}`);
            console.log(`⏰ [Server] Timestamp: ${payload.timestamp}`);

            // Validate payload
            if (!payload.channelId || !payload.messageId || !payload.updatedPoll || !payload.updatedPoll.id) {
                console.error(`❌ [Server] Invalid poll update payload:`, payload);
                return;
            }

            console.log(`📤 [Server] Broadcasting poll update to all users EXCEPT sender`);

            // Enhanced payload with server metadata
            const enhancedPayload = {
                ...payload,
                serverProcessedAt: Date.now(),
                timestamp: payload.timestamp || new Date()
            };

            // Broadcast poll data update to all channel members EXCEPT the sender
            socket.broadcast.emit('pollUpdated', enhancedPayload);
            console.log(`✅ [Server] Poll data update broadcasted to channel ${payload.channelId}`);
            console.log(`📋 [Server] Poll options summary:`, payload.updatedPoll.options.map(opt => ({
                text: opt.text,
                votes: opt.votes.length
            })));
        });

        // Test connection event
        socket.on('testConnection', ({ userId }) => {
            console.log(`🧪 Test connection for user ${userId}, socket ${socket.id}`);
            const socketId = userSocketMap[userId];
            console.log(`📋 User ${userId} mapped to socket ${socketId}`);
            console.log(`📊 Current userSocketMap:`, userSocketMap);
        });

        // Post notification events
        socket.on('postNotificationToChannel', ({ channelId, notification, senderId }) => {
            console.log(`📢 Post notification sent to channel ${channelId}`);
            console.log(`📝 Post: "${notification.title}" by ${notification.authorName}`);
            console.log(`👤 Sender ID: ${senderId}`);

            // Get channel members from ChannelMemberService
            const { ChannelMemberService } = require('./services/channelMemberService');
            const channelMembers = ChannelMemberService.getChannelMemberIds(channelId);

            console.log(`👥 Channel ${channelId} members:`, channelMembers);
            console.log(`📊 All channels in service:`, ChannelMemberService.getAllChannels().map(c => ({ id: c.id, name: c.name, members: c.members.length })));

            // Send notification to ALL channel members INCLUDING the sender
            const recipients = channelMembers;
            console.log(`📤 Sending to all channel members:`, recipients);

            // Send notification to all channel members INCLUDING the sender
            recipients.forEach(recipientId => {
                const recipientSocketId = userSocketMap[recipientId];
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('postNotificationReceived', {
                        channelId,
                        notification,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`✅ Sent notification to ${recipientId} (socket: ${recipientSocketId})`);
                } else {
                    console.log(`❌ Recipient ${recipientId} not connected`);
                }
            });

            console.log(`✅ Post notification sent to ${recipients.length} channel members`);
        });

        // Public post notification events
        socket.on('publicPostNotification', ({ notification }) => {
            console.log(`🌍 Public post notification: "${notification.title}" by ${notification.authorName}`);

            // Broadcast to all connected users EXCEPT the sender to prevent duplicates
            socket.broadcast.emit('publicPostNotificationReceived', {
                notification,
                timestamp: new Date().toISOString()
            });

            console.log(`✅ Public post notification broadcasted to all users`);
        });

    });

    app.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 Server ready on http://localhost:${port}`);
        console.log(`📞 Enhanced Call system initialized (Audio/Video support)`);
        console.log(`💬 Chat system ready`);

        // Enhanced cleanup cho inactive rooms với callType logging
        setInterval(() => {
            const now = Date.now();
            Object.keys(activeRooms).forEach(roomName => {
                const room = activeRooms[roomName];
                const callType = room.callType || 'video';

                // Cleanup rooms older than 5 minutes or stuck in calling state for more than 1 minute
                if (now - room.createdAt > 5 * 60 * 1000 ||
                    (room.status === 'calling' && now - room.createdAt > 60 * 1000)) {
                    console.log(`🗑️ Cleaning up inactive/stuck ${callType} room: ${roomName} (${room.status})`);
                    delete activeRooms[roomName];
                }
            });
        }, 60 * 1000); // Check every minute

        // Log active rooms summary every 5 minutes
        setInterval(() => {
            const totalRooms = Object.keys(activeRooms).length;
            if (totalRooms > 0) {
                const roomTypes = {};
                Object.values(activeRooms).forEach(room => {
                    const type = room.callType || 'video';
                    roomTypes[type] = (roomTypes[type] || 0) + 1;
                });

                console.log(`📊 Active rooms summary: ${totalRooms} total`, roomTypes);
            }
        }, 5 * 60 * 1000);
    });
});