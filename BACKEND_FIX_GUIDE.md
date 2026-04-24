# Backend Fix Guide: API Endpoint Implementation for EchoVault

**For:** Backend Development Team  
**Purpose:** Implement missing endpoints and standardize responses  
**Timeline:** 2-3 weeks  
**Priority:** Critical - Frontend is blocked on these

---

## Current State

### What Works
- ✅ Authentication (login, register, logout)
- ✅ Trending/Featured endpoints
- ✅ Live streams (basic)
- ✅ Artist uploads (with naming issues)
- ✅ Socket.io WebSocket

### What's Missing (CRITICAL)
- ❌ Search endpoint
- ❌ Album endpoints
- ❌ Artist browse endpoints (different from dashboard)
- ❌ Playlist endpoints
- ❌ User profile endpoint
- ❌ Chat endpoints
- ❌ Liked tracks endpoint
- ❌ Genre filtering
- ❌ Music stats/edit/delete endpoints
- ❌ Stream management endpoints

### What's Wrong
- ⚠️ Response formats inconsistent
- ⚠️ Endpoint naming conflicts
- ⚠️ Some endpoints return views instead of JSON

---

## Response Format Standardization

### Current Problem
Different endpoints return different formats:
```javascript
// Sometimes:
{ "success": true, "data": [...] }

// Sometimes:
{ "tracks": [...] }

// Sometimes:
{ "items": [...] }

// Sometimes:
{ "error": "message" }
```

### Required Standard
ALL endpoints must return:
```javascript
// Success response
{
  "success": true,
  "data": {...} or [...],
  "message": "Success"
}

// Error response
{
  "success": false,
  "error": "error message",
  "message": "error message"
}
```

### Implementation (Express.js)
```javascript
// Create response wrapper helper
const sendSuccess = (res, data, message = 'Success') => {
  res.json({
    success: true,
    data,
    message
  });
};

const sendError = (res, statusCode, error, message) => {
  res.status(statusCode).json({
    success: false,
    error,
    message: message || error
  });
};

// Use in all routes:
router.get('/search', async (req, res) => {
  try {
    const results = await search(req.query.q);
    sendSuccess(res, results, 'Search completed');
  } catch (err) {
    sendError(res, 500, err.message, 'Search failed');
  }
});
```

---

## Implementation Priority

### PHASE 1: CRITICAL (Do First - Week 1)

#### 1. Search Endpoint
**File:** `src/routes/tracksRoutes.js`

```javascript
// GET /api/tracks/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return sendError(res, 400, 'Missing query', 'Please provide a search query');
    }

    // Search in videos, shorts, and tracks
    const [videos, shorts] = await Promise.all([
      prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          playCount: true,
          artist: {
            select: { id: true, name: true, username: true }
          }
        }
      }),
      prisma.short.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          playCount: true,
          artist: {
            select: { id: true, name: true, username: true }
          }
        }
      })
    ]);

    const results = [...videos, ...shorts].sort((a, b) => 
      (b.playCount || 0) - (a.playCount || 0)
    );

    sendSuccess(res, results, 'Search results');
  } catch (err) {
    sendError(res, 500, err.message, 'Search failed');
  }
});
```

#### 2. Album Endpoints
**File:** Create `src/routes/albumRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/albums/:id
router.get('/:id', async (req, res) => {
  try {
    const album = await prisma.album.findUnique({
      where: { id: req.params.id },
      include: {
        artist: {
          select: { id: true, name: true, username: true, avatarUrl: true }
        }
      }
    });

    if (!album) {
      return sendError(res, 404, 'Album not found');
    }

    sendSuccess(res, album);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch album');
  }
});

// GET /api/albums/:id/tracks
router.get('/:id/tracks', async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      where: { albumId: req.params.id },
      select: {
        id: true,
        title: true,
        duration: true,
        trackNumber: true,
        artist: {
          select: { id: true, name: true }
        }
      }
    });

    sendSuccess(res, tracks);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch album tracks');
  }
});

module.exports = router;
```

Register in `server.js`:
```javascript
const albumRoutes = require('./src/routes/albumRoutes');
app.use('/api/albums', albumRoutes);
```

#### 3. Artist Browse Endpoints (Different from Dashboard)
**File:** Create `src/routes/artistBrowseRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');

// GET /api/artists/:id - Public artist profile
router.get('/:id', async (req, res) => {
  try {
    const artist = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        isVerified: true,
        bio: true,
        walletBalance: true,
        _count: {
          select: { 
            videos: true,
            shorts: true,
            followers: true
          }
        }
      }
    });

    if (!artist) {
      return sendError(res, 404, 'Artist not found');
    }

    sendSuccess(res, artist);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch artist');
  }
});

// GET /api/artists/:id/tracks - Artist's public tracks
router.get('/:id/tracks', async (req, res) => {
  try {
    const [videos, shorts] = await Promise.all([
      prisma.video.findMany({
        where: { artistId: req.params.id },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          playCount: true,
          createdAt: true
        }
      }),
      prisma.short.findMany({
        where: { artistId: req.params.id },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          playCount: true,
          createdAt: true
        }
      })
    ]);

    const tracks = [...videos, ...shorts].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    sendSuccess(res, tracks);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch artist tracks');
  }
});

module.exports = router;
```

Register in `server.js`:
```javascript
const artistBrowseRoutes = require('./src/routes/artistBrowseRoutes');
app.use('/api/artists', artistBrowseRoutes);
```

---

### PHASE 2: HIGH PRIORITY (Week 1-2)

#### 4. Fix Response Format in Existing Endpoints

Update all existing routes to use standardized format:

```javascript
// BEFORE (Bad)
router.get('/trending', async (req, res) => {
  const tracks = await getTrackList();
  res.json({ tracks }); // Inconsistent format!
});

// AFTER (Good)
router.get('/trending', async (req, res) => {
  const tracks = await getTrackList();
  sendSuccess(res, tracks, 'Trending tracks');
});
```

Files to update:
- [ ] `src/routes/tracksRoutes.js` - All endpoints
- [ ] `src/routes/liveStreamsRoutes.js` - All endpoints
- [ ] `src/routes/artistRoutes.js` - All endpoints
- [ ] `src/routes/authRoutes.js` - All endpoints

#### 5. Fix Endpoint Naming Conflicts

**Option A:** Rename backend endpoints to match frontend expectations (Recommended)

```javascript
// In src/routes/artistRoutes.js
// CHANGE THIS:
router.get('/earnings', artistController.getEarningsBreakdown);
// TO THIS:
router.get('/revenue', artistController.getEarningsBreakdown);

// CHANGE THIS:
router.get('/withdrawals', artistController.getWithdrawalHistory);
// TO THIS:
router.get('/payouts', artistController.getWithdrawalHistory);

// CHANGE THIS:
router.post('/upload-music', artistController.uploadMusic);
// TO THIS:
router.post('/upload/audio', artistController.uploadMusic);

// CHANGE THIS:
router.post('/upload-short', artistController.uploadShort);
// TO THIS:
router.post('/upload/shorts', artistController.uploadShort);
```

**Option B:** Keep backend names, update frontend mapping

If you want to keep current names, add to frontend `EndpointMapper`:
```dart
static const Map<String, String> endpointMappings = {
  '/api/artist/revenue': '/api/artist/earnings',
  '/api/artist/payouts': '/api/artist/withdrawals',
};
```

**Recommendation:** Use Option A (rename backend) - simpler for long-term maintenance.

#### 6. Standardize Live Stream Endpoints

Add missing stream management:

```javascript
// In src/routes/liveStreamsRoutes.js

// POST /api/artist/start-stream
router.post('/start-stream', protect, authorize(['ARTIST']), async (req, res) => {
  try {
    const { title, thumbnail } = req.body;
    
    const stream = await prisma.liveStream.create({
      data: {
        title,
        artistId: req.user.id,
        thumbnailUrl: thumbnail,
        status: 'LIVE',
        startedAt: new Date()
      }
    });

    sendSuccess(res, stream, 'Stream started');
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to start stream');
  }
});

// POST /api/artist/stop-stream
router.post('/stop-stream', protect, authorize(['ARTIST']), async (req, res) => {
  try {
    const { streamId } = req.body;
    
    const stream = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    sendSuccess(res, stream, 'Stream stopped');
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to stop stream');
  }
});
```

---

### PHASE 3: MEDIUM PRIORITY (Week 2-3)

#### 7. User Profile Endpoint
**File:** `src/routes/userRoutes.js` (create new)

```javascript
// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        avatarUrl: true,
        phone: true,
        walletBalance: true,
        isOnline: true,
        createdAt: true
      }
    });

    sendSuccess(res, user);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch profile');
  }
});

// GET /api/user/liked-tracks
router.get('/liked-tracks', protect, async (req, res) => {
  try {
    const liked = await prisma.userLikedTrack.findMany({
      where: { userId: req.user.id },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artist: { select: { name: true } }
          }
        }
      }
    });

    sendSuccess(res, liked.map(l => l.track));
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch liked tracks');
  }
});
```

#### 8. Chat Endpoints
**File:** `src/routes/chatRoutes.js` (create new)

```javascript
// GET /api/chat/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await prisma.chat.findMany({
      where: {
        OR: [
          { userId1: req.user.id },
          { userId2: req.user.id }
        ]
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    sendSuccess(res, conversations);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch conversations');
  }
});
```

#### 9. Genre Filtering
**File:** `src/routes/tracksRoutes.js`

```javascript
// GET /api/tracks/genre/:genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const [videos, shorts] = await Promise.all([
      prisma.video.findMany({
        where: { genre },
        take: 10
      }),
      prisma.short.findMany({
        where: { genre },
        take: 10
      })
    ]);

    sendSuccess(res, [...videos, ...shorts]);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch genre tracks');
  }
});
```

#### 10. Music Management Endpoints
**File:** `src/routes/artistRoutes.js`

```javascript
// PUT /api/artist/music/:musicId
router.put('/music/:musicId', protect, async (req, res) => {
  try {
    const updated = await prisma.video.update({
      where: { id: req.params.musicId },
      data: req.body
    });
    sendSuccess(res, updated);
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to update music');
  }
});

// DELETE /api/artist/music/:musicId
router.delete('/music/:musicId', protect, async (req, res) => {
  try {
    await prisma.video.delete({
      where: { id: req.params.musicId }
    });
    sendSuccess(res, null, 'Music deleted');
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to delete music');
  }
});

// GET /api/artist/music/:musicId/stats
router.get('/music/:musicId/stats', protect, async (req, res) => {
  try {
    const music = await prisma.video.findUnique({
      where: { id: req.params.musicId }
    });
    
    if (!music) {
      return sendError(res, 404, 'Music not found');
    }

    sendSuccess(res, {
      id: music.id,
      playCount: music.playCount,
      likeCount: music.likeCount,
      giftCount: music.giftCount,
      comments: music.commentCount
    });
  } catch (err) {
    sendError(res, 500, err.message, 'Failed to fetch music stats');
  }
});
```

---

## Testing Endpoints

### Use Postman Collection
Open: `.postman/EchoVault_API_Testing.postman_collection.json`

### Or Test Manually
```bash
# Search
curl "http://localhost:5000/api/tracks/search?q=music"

# Album
curl "http://localhost:5000/api/albums/album123"

# Artist
curl "http://localhost:5000/api/artists/artist123"

# Search with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/tracks/search?q=music"
```

---

## Response Format Checklist

Before committing, verify all responses:
- [ ] All success responses have `{ success: true, data, message }`
- [ ] All error responses have `{ success: false, error, message }`
- [ ] No `{ tracks: [] }` responses - should be `{ data: [] }`
- [ ] No `{ items: [] }` responses - should be `{ data: [] }`
- [ ] Status codes are correct (200, 400, 404, 500)
- [ ] Error messages are descriptive

---

## Helper Function Template

```javascript
// Add to src/utils/response.js (create if needed)

exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

exports.sendError = (res, statusCode = 500, error, message) => {
  res.status(statusCode).json({
    success: false,
    error,
    message: message || error
  });
};

// Use in routes:
const { sendSuccess, sendError } = require('../utils/response');
```

---

## Deployment Strategy

### Week 1
- [ ] Implement search
- [ ] Implement albums
- [ ] Implement artist browse
- [ ] Standardize responses
- [ ] Fix endpoint naming
- [ ] Test everything
- [ ] Push to staging

### Week 2
- [ ] Implement user profile & liked tracks
- [ ] Implement chat endpoints
- [ ] Implement genre filtering
- [ ] Implement live stream management
- [ ] Test everything
- [ ] Push to staging

### Week 3
- [ ] Implement music management (edit/delete/stats)
- [ ] Final testing
- [ ] Code review
- [ ] Deploy to production

---

## Success Criteria

✅ All endpoints return standard format  
✅ All endpoints tested and working  
✅ Error handling consistent  
✅ Frontend can use all endpoints  
✅ Response times < 500ms  
✅ No breaking changes to existing code  

---

## Questions?

Share `FRONTEND_BACKEND_COMPARISON.md` for full details on what's needed.
