const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/messages/conversations - List user's conversations
// Returns a structure compatible with Flutter mock server.js:
// [{ id, user: { id, username }, lastMessage, lastMessageTime, unreadCount }]
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Direct message conversations (pairwise)
    // We treat each unique other participant as a conversation.
    // lastMessage is derived from the newest DirectMessage between the pair.
    const directMessages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        text: true,
        isRead: true,
        createdAt: true,
      },
    });

    // Group by the "other user" id.
    const byOther = new Map();

    for (const msg of directMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!byOther.has(otherId)) {
        byOther.set(otherId, {
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        });
      }
    }

    // Compute unread counts per conversation (messages received by the user that are unread)
    const unreadCounts = await prisma.directMessage.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: { _all: true },
    }).catch(() => []);

    // Normalize unread counts map: otherId(senderId) -> count
    const unreadMap = new Map();
    for (const row of unreadCounts) {
      // Here "senderId" is the other participant.
      unreadMap.set(row.senderId, row._count._all);
    }

    const otherIds = Array.from(byOther.keys());
    const otherUsers = otherIds.length
      ? await prisma.user.findMany({
          where: { id: { in: otherIds } },
          select: { id: true, username: true, name: true },
        })
      : [];

    const usersById = new Map(otherUsers.map((u) => [u.id, u]));

    // Build response
    const conversations = otherIds.map((otherId) => {
      const meta = byOther.get(otherId);
      const otherUser = usersById.get(otherId);

      // Create a stable conversation id (pair hash-like)
      // For now we just use the otherId as id for compatibility.
      return {
        id: otherId,
        user: {
          id: otherId,
          username: otherUser?.username || otherUser?.name || 'Unknown',
        },
        lastMessage: meta?.lastMessage || '',
        lastMessageTime: meta?.lastMessageTime
          ? meta.lastMessageTime.toISOString()
          : null,
        unreadCount: unreadMap.get(otherId) || 0,
      };
    });

    // Sort by lastMessageTime desc
    conversations.sort((a, b) => {
      const ta = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const tb = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return tb - ta;
    });

    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
});

module.exports = router;

