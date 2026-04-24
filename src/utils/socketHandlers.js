const prisma = require('../utils/prisma');

// Handle socket authentication
function authenticateSocket(socket, io) {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    socket.disconnect(true);
    return null;
  }

  try {
    const decoded = require('../utils/jwt').verifyToken(token);
    return decoded;
  } catch (error) {
    console.error('Socket authentication failed:', error.message);
    socket.disconnect(true);
    return null;
  }
}

// Socket.io event handlers for real-time features
module.exports = function setupSocketHandlers(io) {
  // Map to store active streams and connected users
  const activeStreams = new Map();
  const userSockets = new Map(); // userId -> [socketIds]

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate socket connection
    const user = authenticateSocket(socket, io);
    if (!user) return;

    // Track user socket connections
    if (!userSockets.has(user.id)) {
      userSockets.set(user.id, []);
    }
    userSockets.get(user.id).push(socket.id);

    // ============ STREAM EVENTS ============

    // Join live stream
    socket.on('joinStream', async (streamId, callback) => {
      try {
        socket.join(`stream:${streamId}`);
        
        // Track stream viewers
        if (!activeStreams.has(streamId)) {
          activeStreams.set(streamId, {
            viewers: new Set(),
            totalViewers: 0,
            startTime: new Date(),
          });
        }
        activeStreams.get(streamId).viewers.add(user.id);

        // Update stream viewer count in database
        await prisma.liveStream.update({
          where: { id: streamId },
          data: {
            viewerCount: activeStreams.get(streamId).viewers.size,
            isLive: true,
          },
        }).catch(() => {
          // Stream might not exist yet
        });

        // Notify others in stream
        io.to(`stream:${streamId}`).emit('userJoinedStream', {
          userId: user.id,
          userName: user.name,
          totalViewers: activeStreams.get(streamId).viewers.size,
        });

        if (callback) callback({ success: true, viewers: activeStreams.get(streamId).viewers.size });
      } catch (error) {
        console.error('Join stream error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Leave live stream
    socket.on('leaveStream', async (streamId, callback) => {
      try {
        socket.leave(`stream:${streamId}`);
        
        if (activeStreams.has(streamId)) {
          activeStreams.get(streamId).viewers.delete(user.id);

          // Update stream viewer count
          await prisma.liveStream.update({
            where: { id: streamId },
            data: {
              viewerCount: activeStreams.get(streamId).viewers.size,
            },
          }).catch(() => {});

          io.to(`stream:${streamId}`).emit('userLeftStream', {
            userId: user.id,
            totalViewers: activeStreams.get(streamId).viewers.size,
          });
        }

        if (callback) callback({ success: true });
      } catch (error) {
        console.error('Leave stream error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============ GIFT EVENTS (MAIN INCOME SOURCE) ============

    socket.on('sendGift', async (giftData, callback) => {
      try {
        const {
          streamId,
          giftId,
          quantity = 1,
          amount,
          receiverId,
        } = giftData;

        if (!receiverId || !amount) {
          return callback?.({
            success: false,
            error: 'Missing required fields: receiverId, amount',
          });
        }

        // Create gift record in database
        const gift = await prisma.gift.create({
          data: {
            senderId: user.id,
            receiverId,
            giftId: giftId || 'generic-gift',
            quantity,
            amount,
            streamId: streamId || null,
            createdAt: new Date(),
          },
        });

        // Update receiver's wallet
        await prisma.user.update({
          where: { id: receiverId },
          data: {
            walletBalance: {
              increment: amount,
            },
          },
        });

        // Update stream gift count if applicable
        if (streamId) {
          await prisma.liveStream.update({
            where: { id: streamId },
            data: {
              totalGifts: {
                increment: quantity,
              },
              totalGiftAmount: {
                increment: amount,
              },
            },
          }).catch(() => {});
        }

        // Broadcast gift to stream/recipient
        if (streamId) {
          io.to(`stream:${streamId}`).emit('newGift', {
            senderName: user.name,
            senderId: user.id,
            receiverId,
            giftId,
            quantity,
            amount,
            timestamp: new Date().toISOString(),
            totalStreamGifts: (await prisma.liveStream.findUnique({
              where: { id: streamId },
              select: { totalGifts: true },
            }))?.totalGifts || 0,
          });
        } else {
          // Send to recipient's sockets
          const recipientSockets = userSockets.get(receiverId) || [];
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit('giftReceived', {
              senderName: user.name,
              senderId: user.id,
              giftId,
              quantity,
              amount,
              timestamp: new Date().toISOString(),
            });
          });
        }

        // Emit to sender confirmation
        callback?.({
          success: true,
          giftId: gift.id,
          message: `Gift sent successfully! ${receiverId} received ${quantity}x gift`,
        });

        console.log(`Gift sent: ${user.id} -> ${receiverId} (Amount: ${amount})`);
      } catch (error) {
        console.error('Send gift error:', error);
        callback?.({
          success: false,
          error: error.message,
        });
      }
    });

    // Get available gifts for UI
    socket.on('getAvailableGifts', async (callback) => {
      try {
        const gifts = await prisma.gift.findMany({
          select: {
            id: true,
            giftId: true,
            name: true,
            image: true,
            baseAmount: true,
          },
          distinct: ['giftId'],
        }).catch(() => []);

        callback?.({
          success: true,
          gifts: gifts || [],
        });
      } catch (error) {
        callback?.({
          success: false,
          error: error.message,
        });
      }
    });

    // ============ CHAT EVENTS ============

    socket.on('sendChatMessage', async (messageData, callback) => {
      try {
        const {
          streamId,
          text,
          receiverId,
        } = messageData;

        if (!text || text.trim().length === 0) {
          return callback?.({
            success: false,
            error: 'Message cannot be empty',
          });
        }

        // Store message in database (if applicable)
        if (streamId) {
          const message = await prisma.streamChat.create({
            data: {
              streamId,
              senderId: user.id,
              text,
              createdAt: new Date(),
            },
          }).catch(() => null);

          // Broadcast to stream
          io.to(`stream:${streamId}`).emit('newChatMessage', {
            messageId: message?.id,
            senderName: user.name,
            senderId: user.id,
            text,
            timestamp: new Date().toISOString(),
          });
        } else if (receiverId) {
          // Direct message
          const message = await prisma.directMessage.create({
            data: {
              senderId: user.id,
              receiverId,
              text,
              isRead: false,
              createdAt: new Date(),
            },
          }).catch(() => null);

          // Send to recipient's sockets
          const recipientSockets = userSockets.get(receiverId) || [];
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit('newDirectMessage', {
              messageId: message?.id,
              senderName: user.name,
              senderId: user.id,
              text,
              timestamp: new Date().toISOString(),
            });
          });
        }

        callback?.({
          success: true,
          message: 'Message sent successfully',
        });
      } catch (error) {
        console.error('Send message error:', error);
        callback?.({
          success: false,
          error: error.message,
        });
      }
    });

    // ============ NOTIFICATION EVENTS ============

    socket.on('notifyUser', async (notificationData, callback) => {
      try {
        const {
          userId,
          title,
          body,
          type,
        } = notificationData;

        // Store notification
        const notification = await prisma.notification.create({
          data: {
            userId,
            title,
            body,
            type: type || 'info',
            isRead: false,
            createdAt: new Date(),
          },
        }).catch(() => null);

        // Send to user's sockets
        const userSocketIds = userSockets.get(userId) || [];
        userSocketIds.forEach((socketId) => {
          io.to(socketId).emit('notification', {
            notificationId: notification?.id,
            title,
            body,
            type,
            timestamp: new Date().toISOString(),
          });
        });

        callback?.({
          success: true,
          message: 'Notification sent',
        });
      } catch (error) {
        console.error('Notification error:', error);
        callback?.({
          success: false,
          error: error.message,
        });
      }
    });

    // ============ CLEANUP ============

    socket.on('disconnect', async () => {
      try {
        // Remove user socket from tracking
        if (userSockets.has(user.id)) {
          const sockets = userSockets.get(user.id);
          const index = sockets.indexOf(socket.id);
          if (index > -1) sockets.splice(index, 1);

          if (sockets.length === 0) {
            userSockets.delete(user.id);
            // Update user as offline if no other connections
            await prisma.user.update({
              where: { id: user.id },
              data: { isOnline: false },
            }).catch(() => {});
          }
        }

        // Leave all streams
        const rooms = socket.rooms;
        for (const room of rooms) {
          if (room.startsWith('stream:')) {
            const streamId = room.replace('stream:', '');
            if (activeStreams.has(streamId)) {
              activeStreams.get(streamId).viewers.delete(user.id);
              io.to(room).emit('userLeftStream', {
                userId: user.id,
                totalViewers: activeStreams.get(streamId).viewers.size,
              });
            }
          }
        }

        console.log('User disconnected:', socket.id);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

  return {
    activeStreams,
    userSockets,
  };
};
