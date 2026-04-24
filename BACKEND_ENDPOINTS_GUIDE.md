# Backend Endpoints Setup Guide

## Overview
Your backend now has two new endpoint groups that serve data to your Flutter frontend:

- **`/api/tracks/trending`** - Trending videos and shorts
- **`/api/live/streams`** - Live streaming endpoints

The data format returned by these endpoints matches exactly what your Flutter app's UI expects.

---

## Endpoints Reference

### 1. GET `/api/tracks/trending`
Returns trending videos and shorts sorted by play count.

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```
GET http://localhost:5000/api/tracks/trending?limit=5&offset=0
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "video-1",
      "title": "Electronic Vibes 2024",
      "type": "video",
      "cover": "https://example.com/thumbnail.jpg",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "playCount": 5421,
      "duration": 240,
      "fileUrl": "https://example.com/video.mp4",
      "createdAt": "2024-04-15T12:30:00Z"
    },
    {
      "id": "short-1",
      "title": "Dance Challenge #1",
      "type": "short",
      "cover": "https://example.com/thumbnail.jpg",
      "artist": "Luna Beats",
      "artistId": "artist-456",
      "playCount": 8234,
      "giftCount": 156,
      "duration": 60,
      "videoUrl": "https://example.com/short.mp4",
      "createdAt": "2024-04-14T15:20:00Z"
    }
  ],
  "count": 2
}
```

---

### 2. GET `/api/tracks/featured`
Returns top featured videos and shorts for dashboard carousel.

**Query Parameters:**
- `limit` (optional): Number of featured items (default: 5)

**Example Request:**
```
GET http://localhost:5000/api/tracks/featured?limit=5
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "video-1",
      "title": "Electronic Vibes 2024",
      "cover": "https://example.com/thumbnail.jpg",
      "artist": "DJ Shadow"
    }
  ]
}
```

---

### 3. GET `/api/live/streams`
Returns all live streams (active, scheduled, or ended).

**Query Parameters:**
- `status` (optional): Filter by stream status - `LIVE`, `SCHEDULED`, or `ENDED` (default: LIVE)
- `limit` (optional): Number of items to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Example Requests:**
```
GET http://localhost:5000/api/live/streams?status=LIVE&limit=5
GET http://localhost:5000/api/live/streams?status=SCHEDULED
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "live-1",
      "title": "DJ Set House Music",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "artistAvatar": "https://example.com/avatar.jpg",
      "isVerified": true,
      "status": "LIVE",
      "viewers": 1247,
      "giftCount": 342,
      "thumbnail": "https://example.com/avatar.jpg",
      "scheduledAt": null,
      "startedAt": "2024-04-15T18:00:00Z",
      "createdAt": "2024-04-15T12:30:00Z"
    }
  ],
  "count": 1,
  "status": "LIVE"
}
```

---

### 4. GET `/api/live/streams/active`
Returns only currently active (LIVE) streams.

**Query Parameters:**
- `limit` (optional): Number of active streams (default: 5)

**Example Request:**
```
GET http://localhost:5000/api/live/streams/active?limit=5
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "live-1",
      "title": "DJ Set House Music",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "thumbnail": "https://example.com/avatar.jpg",
      "viewers": 1247,
      "giftCount": 342,
      "isVerified": true
    }
  ],
  "liveCount": 1
}
```

---

### 5. GET `/api/live/streams/:id`
Returns detailed information about a specific stream.

**Example Request:**
```
GET http://localhost:5000/api/live/streams/live-1
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "live-1",
    "title": "DJ Set House Music",
    "artist": {
      "id": "artist-123",
      "name": "DJ Shadow",
      "username": "dj-shadow",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isVerified": true,
      "walletBalance": 2500.50
    },
    "status": "LIVE",
    "viewers": 1247,
    "totalGiftValue": 3420.50,
    "gifts": [
      {
        "id": "gift-1",
        "amount": 50.00,
        "sender": {
          "id": "user-456",
          "username": "fan-user",
          "avatarUrl": "https://example.com/user-avatar.jpg"
        },
        "createdAt": "2024-04-15T18:15:00Z"
      }
    ],
    "scheduledAt": null,
    "startedAt": "2024-04-15T18:00:00Z",
    "endedAt": null,
    "createdAt": "2024-04-15T12:30:00Z"
  }
}
```

---

## Setup Steps

### 1. Start Your Backend
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
npm install
npm run dev  # or npm start for production
```

### 2. Seed Demo Data (Optional)
To populate your database with test data:
```bash
node seed-demo.js
```

This will create:
- 3 demo artists
- 3 demo videos
- 3 demo shorts
- 3 demo live streams (2 LIVE, 1 SCHEDULED)

### 3. Test the Endpoints
Use Postman, Curl, or your browser to test:

```bash
# Test trending tracks
curl http://localhost:5000/api/tracks/trending

# Test featured tracks
curl http://localhost:5000/api/tracks/featured

# Test live streams
curl http://localhost:5000/api/live/streams?status=LIVE

# Test active streams
curl http://localhost:5000/api/live/streams/active
```

---

## Data Format Alignment with Flutter UI

The response formats are designed to match your Flutter screens:

### For `MainScreen` (Dashboard)
- **musicVideos** array expects: `{ title, cover, artist, playCount, duration }`
  - ✅ Provided by `/api/tracks/featured`

- **liveDemos** array expects: `{ id, title, thumbnail, artist, viewers, isVerified }`
  - ✅ Provided by `/api/live/streams/active`

### For `TrendingPage` (Explore)
- Expects trending content with metadata
  - ✅ Provided by `/api/tracks/trending`

### For `LiveStreamsPage`
- Expects active and upcoming live streams
  - ✅ Provided by `/api/live/streams?status=LIVE` and `/api/live/streams?status=SCHEDULED`

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Description of what went wrong",
  "error": "Detailed error message"
}
```

HTTP Status Codes:
- `200` - Success
- `404` - Resource not found (e.g., specific stream ID doesn't exist)
- `500` - Server error

---

## Next Steps

1. **Update Flutter AppConfig** to point to your backend URL:
   ```dart
   class AppConfig {
     static const String apiBaseUrl = 'http://localhost:5000';  // or http://10.0.2.2:5000 for emulator
   }
   ```

2. **Update EchoVaultApiService** to use these endpoints:
   ```dart
   Future<List<Track>> getTrendingTracks() async {
     final response = await apiClient.get('/api/tracks/trending');
     return (response['data'] as List).map((t) => Track.fromJson(t)).toList();
   }
   ```

3. **Test the connection** by running your Flutter app

---

## Common Issues

**Q: Getting 404 errors on endpoints?**
- Make sure server.js includes the route imports:
  ```javascript
  const tracksRoutes = require('./src/routes/tracksRoutes');
  const liveStreamsRoutes = require('./src/routes/liveStreamsRoutes');
  
  app.use('/api/tracks', tracksRoutes);
  app.use('/api/live', liveStreamsRoutes);
  ```

**Q: Empty data returned?**
- Run `node seed-demo.js` to populate your database with test data

**Q: Connection refused from Flutter app?**
- If using Android emulator, use `http://10.0.2.2:5000` instead of `localhost`
- If using iOS simulator, use `http://localhost:5000`

**Q: CORS errors?**
- Your server.js already has CORS configured to accept `localhost` and `10.0.2.2`

---

## Questions?
Your backend is now ready to serve your Flutter frontend! Start your server and test these endpoints.
