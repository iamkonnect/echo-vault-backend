# EchoVault API Contract - Frontend/Backend Synchronization

## Overview
This document defines the exact API endpoints, request/response formats, and error handling that both frontend and backend must follow.

## Base URLs
- **Development**: `http://localhost:5000/api`
- **Local Network**: `http://192.168.x.x:5000/api` (Android physical device)
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **Azure Production**: `https://echovault-backend.azurewebsites.net/api`

---

## 1. HEALTH & STATUS

### GET /api/health
Check if backend is online

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

---

## 2. LIVE STREAMING

### GET /api/live/streams
Get all live streams (paginated)

**Query Parameters:**
- `status`: `LIVE`, `SCHEDULED`, `ENDED` (default: `LIVE`)
- `limit`: Max records (default: 10)
- `offset`: Skip records (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "stream_123",
      "title": "Live Music Performance",
      "artist": "Artist Name",
      "artistId": "user_456",
      "artistAvatar": "https://...",
      "isVerified": true,
      "status": "LIVE",
      "viewers": 150,
      "giftCount": 45,
      "thumbnail": "https://...",
      "scheduledAt": "2024-01-01T12:00:00Z",
      "startedAt": "2024-01-01T12:05:00Z",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "count": 1,
  "status": "LIVE"
}
```

### GET /api/live/streams/active
Get only currently LIVE streams

**Response:**
```json
{
  "success": true,
  "data": [...],
  "liveCount": 5
}
```

### GET /api/live/streams/:id
Get specific stream details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "stream_123",
    "title": "...",
    "artist": {...},
    "status": "LIVE",
    "viewers": 150,
    "totalGiftValue": 500,
    "gifts": [
      {
        "id": "gift_123",
        "amount": 10,
        "sender": {...},
        "createdAt": "..."
      }
    ],
    "startedAt": "...",
    "endedAt": null,
    "createdAt": "..."
  }
}
```

### POST /api/live/streams/start
Start a live stream (Artist only - requires auth)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "My Live Stream",
  "description": "Stream description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "stream_123",
    "title": "My Live Stream",
    "status": "LIVE",
    "message": "Live stream started"
  }
}
```

### POST /api/live/streams/stop
Stop a live stream (Artist only)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "streamId": "stream_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "stream_123",
    "status": "ENDED",
    "message": "Live stream ended"
  }
}
```

### POST /api/live/streams/join-request
Join a live stream

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "streamId": "stream_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "stream_123",
    "joinedAt": "2024-01-01T12:00:00Z",
    "message": "Joined stream successfully"
  }
}
```

---

## 3. GIFTS & GIFTING

### GET /api/gifting
Get available gifts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gift_1",
      "name": "Rose",
      "amount": 5,
      "icon": "🌹",
      "isActive": true
    },
    {
      "id": "gift_5",
      "name": "Heart",
      "amount": 10,
      "icon": "❤️",
      "isActive": true
    }
  ],
  "count": 4
}
```

### POST /api/gifting/send
Send a gift

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "receiverId": "user_456",
  "amount": 10,
  "quantity": 1,
  "giftId": "gift_5",
  "streamId": "stream_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gift_record_789",
    "message": "Gift sent successfully! 1x gift sent for $10"
  }
}
```

---

## 4. PAYMENTS

### GET /api/payments/coin-packages
Get available coin packages

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "50 Coins",
      "coins": 50,
      "price": 4.99,
      "popular": false
    },
    {
      "id": "5",
      "name": "250 Coins",
      "coins": 250,
      "price": 19.99,
      "popular": true
    }
  ],
  "count": 4
}
```

### POST /api/payments/initiate
Initiate a payment

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "packageId": "5",
  "amount": 19.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123",
    "sessionId": "session_456",
    "amount": 19.99,
    "packageId": "5",
    "status": "PENDING",
    "message": "Payment session created"
  }
}
```

### POST /api/payments/webhook
Process payment webhook

**Body:**
```json
{
  "paymentId": "pay_123",
  "status": "COMPLETED",
  "amount": 19.99
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_123",
    "status": "COMPLETED",
    "message": "Payment status updated"
  }
}
```

---

## 5. WEBSOCKET (Socket.IO) EVENTS

### Events: Client → Server
- `joinStream` - Join a live stream
- `leaveStream` - Leave a live stream
- `sendGift` - Send a gift
- `sendChatMessage` - Send a chat message
- `getAvailableGifts` - Get available gifts
- `notifyUser` - Send notification

### Events: Server → Client
- `newChatMessage` - Broadcast chat message
- `newGift` - Broadcast gift sent
- `userJoinedStream` - User joined stream
- `userLeftStream` - User left stream
- `giftReceived` - Direct gift notification
- `notification` - Notification event

### Socket.IO Connection Example (Dart)
```dart
_socket = IO.io(
  'https://echovault-backend.azurewebsites.net',
  OptionBuilder()
    .setTransports(['websocket'])
    .disableAutoConnect()
    .setAuth({'token': authToken})
    .setReconnectionDelay(1000)
    .setReconnectionDelayMax(5000)
    .build(),
);

_socket.connect();
_socket.on('connect', (_) {
  print('Connected');
});

_socket.emit('joinStream', 'stream_123', (response) {
  print('Joined: $response');
});
```

---

## 6. ERROR RESPONSES

### Format
All errors follow this format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details (development only)"
}
```

### Common Error Codes

| Status | Scenario |
|--------|----------|
| 400    | Missing/invalid required fields |
| 401    | Not authenticated or invalid token |
| 404    | Resource not found |
| 500    | Server error |

### Examples

**Missing required fields:**
```json
{
  "success": false,
  "message": "Missing required fields: receiverId, amount"
}
```

**Unauthorized:**
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

**Server error (development):**
```json
{
  "success": false,
  "message": "Database operation failed",
  "error": "Cannot read property 'id' of undefined"
}
```

---

## 7. AUTHENTICATION

### Header Format
```
Authorization: Bearer <jwt_token>
```

### Token Structure (JWT)
```json
{
  "id": "user_123",
  "email": "artist@example.com",
  "name": "Artist Name",
  "role": "artist",
  "iat": 1234567890,
  "exp": 1234654290
}
```

---

## 8. CORS & SECURITY

### CORS Origins (Allowed)
- `http://localhost:3000` (dev web)
- `http://localhost:5173` (vite dev)
- `http://localhost:*` (local development)
- `http://10.0.2.2:*` (Android emulator)
- `https://echovault-frontend.eastus.azurecontainer.io` (Azure)
- `https://echovault-backend.azurewebsites.net` (Azure)

### CORS Methods
- GET, POST, PUT, DELETE, OPTIONS

### Required Headers
- Content-Type: application/json
- Authorization: Bearer <token> (for protected routes)

---

## 9. VALIDATION RULES

### Required Fields by Endpoint

**POST /api/live/streams/start:**
- `title` (string, required, min 3 chars)

**POST /api/live/streams/stop:**
- `streamId` (string, required)

**POST /api/gifting/send:**
- `receiverId` (string, required)
- `amount` (number, required, > 0)

**POST /api/payments/initiate:**
- `packageId` (string, required)
- `amount` (number, required)

---

## 10. RESPONSE TIME EXPECTATIONS

- **GET /api/health**: < 100ms
- **GET /api/live/streams**: < 500ms
- **POST /api/gifting/send**: < 1000ms
- **Socket.IO events**: < 2000ms (with callback timeout)

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get live streams
curl http://localhost:5000/api/live/streams

# Get available gifts
curl http://localhost:5000/api/gifting \
  -H "Authorization: Bearer <token>"

# Start a stream
curl -X POST http://localhost:5000/api/live/streams/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Stream"}'

# Send a gift
curl -X POST http://localhost:5000/api/gifting/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "user_456",
    "amount": 10,
    "streamId": "stream_123"
  }'
```

### Using Postman
See `EchoVault_API_Testing.postman_collection.json` in repo

---

## Frontend Implementation

### Flutter API Calls
```dart
// Get streams
final response = await apiClient.get('/api/live/streams?status=LIVE');

// Start stream
final response = await apiClient.post('/api/live/streams/start', body: {
  'title': 'My Stream',
  'description': 'Description'
});

// Send gift
final response = await apiClient.post('/api/gifting/send', body: {
  'receiverId': receiverId,
  'amount': amount,
  'streamId': streamId
});
```

---

## Changelog

| Date | Change |
|------|--------|
| 2024-01-01 | Initial API contract |
| 2024-01-02 | Added CORS configuration |
| 2024-01-03 | Added Socket.IO events |
| 2024-01-04 | Added error response format |

---

## Support & Issues

If endpoints are missing or responses don't match this contract:
1. Check this document first
2. Run `curl http://localhost:5000/api/health`
3. Check server logs
4. Verify authentication token
5. Check request body format
