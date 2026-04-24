# 🎯 Flutter to Backend Integration Guide

## Backend Base URL

**Your Backend Base URL:** `http://localhost:5000`

(Use `http://10.0.2.2:5000` for Android emulator, `http://localhost:5000` for iOS simulator)

---

## Available Endpoints

### 1️⃣ **Trending Tracks**

**Endpoint:** `GET /api/tracks/trending`

**Purpose:** Get trending videos and shorts for Explore/Trending page

**Example URL:** `http://localhost:5000/api/tracks/trending?limit=10`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "video-1",
      "title": "Electronic Vibes 2024",
      "type": "video",
      "cover": "https://...",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "playCount": 5421,
      "duration": 240,
      "fileUrl": "https://..."
    }
  ],
  "count": 10
}
```

**Flutter Usage:**
```dart
Future<List<Map<String, dynamic>>> getTrendingTracks() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/tracks/trending'),
  );
  if (response.statusCode == 200) {
    final json = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(json['data']);
  }
  throw Exception('Failed to load trending tracks');
}
```

---

### 2️⃣ **Featured Tracks**

**Endpoint:** `GET /api/tracks/featured`

**Purpose:** Get top featured items for dashboard carousel

**Example URL:** `http://localhost:5000/api/tracks/featured?limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "video-1",
      "title": "Electronic Vibes 2024",
      "cover": "https://...",
      "artist": "DJ Shadow"
    }
  ]
}
```

**Flutter Usage:**
```dart
Future<List<Map<String, String>>> getFeaturedTracks() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/tracks/featured'),
  );
  if (response.statusCode == 200) {
    final json = jsonDecode(response.body);
    return (json['data'] as List).map<Map<String, String>>((item) => {
      'title': item['title'].toString(),
      'cover': item['cover'].toString(),
      'artist': item['artist'].toString(),
    }).toList();
  }
  throw Exception('Failed to load featured tracks');
}
```

---

### 3️⃣ **Live Streams (All Status)**

**Endpoint:** `GET /api/live/streams`

**Purpose:** Get all live streams filtered by status

**Example URLs:**
- `http://localhost:5000/api/live/streams?status=LIVE` - Only active streams
- `http://localhost:5000/api/live/streams?status=SCHEDULED` - Upcoming streams
- `http://localhost:5000/api/live/streams?status=ENDED` - Past streams

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "live-1",
      "title": "DJ Set House Music",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "artistAvatar": "https://...",
      "isVerified": true,
      "status": "LIVE",
      "viewers": 1247,
      "giftCount": 342,
      "thumbnail": "https://..."
    }
  ],
  "count": 1,
  "status": "LIVE"
}
```

**Flutter Usage:**
```dart
Future<List<Map<String, dynamic>>> getLiveStreams({String status = 'LIVE'}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/live/streams?status=$status'),
  );
  if (response.statusCode == 200) {
    final json = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(json['data']);
  }
  throw Exception('Failed to load live streams');
}
```

---

### 4️⃣ **Active Live Streams Only**

**Endpoint:** `GET /api/live/streams/active`

**Purpose:** Get only currently LIVE streams for dashboard

**Example URL:** `http://localhost:5000/api/live/streams/active?limit=5`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "live-1",
      "title": "DJ Set House Music",
      "artist": "DJ Shadow",
      "artistId": "artist-123",
      "thumbnail": "https://...",
      "viewers": 1247,
      "giftCount": 342,
      "isVerified": true
    }
  ],
  "liveCount": 1
}
```

**Flutter Usage:**
```dart
Future<List<Map<String, dynamic>>> getActiveLiveStreams() async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/live/streams/active'),
  );
  if (response.statusCode == 200) {
    final json = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(json['data']);
  }
  throw Exception('Failed to load active streams');
}
```

---

### 5️⃣ **Stream Details**

**Endpoint:** `GET /api/live/streams/:id`

**Purpose:** Get detailed info about a specific stream including gift history

**Example URL:** `http://localhost:5000/api/live/streams/live-1`

**Response:**
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
      "avatarUrl": "https://...",
      "isVerified": true
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
          "avatarUrl": "https://..."
        },
        "createdAt": "2024-04-15T18:15:00Z"
      }
    ],
    "startedAt": "2024-04-15T18:00:00Z"
  }
}
```

**Flutter Usage:**
```dart
Future<Map<String, dynamic>> getStreamDetails(String streamId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/live/streams/$streamId'),
  );
  if (response.statusCode == 200) {
    final json = jsonDecode(response.body);
    return json['data'];
  }
  throw Exception('Failed to load stream details');
}
```

---

## 🔧 Setup Your Flutter App

### Step 1: Update `AppConfig.dart`

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';

class AppConfig {
  // Auto-detect the correct URL based on platform
  static String get apiBaseUrl {
    if (kIsWeb) return 'http://localhost:5000';
    if (Platform.isAndroid) return 'http://10.0.2.2:5000';
    return 'http://localhost:5000';
  }

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration readTimeout = Duration(seconds: 30);
  static const bool isDevelopment = true;
}
```

### Step 2: Update `EchoVaultApiService.dart` (or similar service)

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'app_config.dart';

class EchoVaultApiService {
  final String baseUrl = AppConfig.apiBaseUrl;

  // Get trending tracks for explore page
  Future<List<Map<String, dynamic>>> getTrendingTracks({
    int limit = 10,
    int offset = 0,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/tracks/trending?limit=$limit&offset=$offset'),
      ).timeout(AppConfig.connectTimeout);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(json['data'] ?? []);
      }
      throw Exception('Failed to load trending tracks');
    } catch (e) {
      rethrow;
    }
  }

  // Get featured tracks for dashboard
  Future<List<Map<String, dynamic>>> getFeaturedTracks({int limit = 5}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/tracks/featured?limit=$limit'),
      ).timeout(AppConfig.connectTimeout);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(json['data'] ?? []);
      }
      throw Exception('Failed to load featured tracks');
    } catch (e) {
      rethrow;
    }
  }

  // Get live streams
  Future<List<Map<String, dynamic>>> getLiveStreams({
    String status = 'LIVE',
    int limit = 10,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/live/streams?status=$status&limit=$limit'),
      ).timeout(AppConfig.connectTimeout);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(json['data'] ?? []);
      }
      throw Exception('Failed to load live streams');
    } catch (e) {
      rethrow;
    }
  }

  // Get active (LIVE) streams for dashboard
  Future<List<Map<String, dynamic>>> getActiveLiveStreams({int limit = 5}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/live/streams/active?limit=$limit'),
      ).timeout(AppConfig.connectTimeout);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(json['data'] ?? []);
      }
      throw Exception('Failed to load active streams');
    } catch (e) {
      rethrow;
    }
  }

  // Get stream details
  Future<Map<String, dynamic>> getStreamDetails(String streamId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/live/streams/$streamId'),
      ).timeout(AppConfig.connectTimeout);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return json['data'] ?? {};
      }
      throw Exception('Failed to load stream details');
    } catch (e) {
      rethrow;
    }
  }
}
```

### Step 3: Use in Your Screens

**For `MainScreen.dart` (Dashboard):**
```dart
@override
void initState() {
  super.initState();
  _loadDashboardData();
}

Future<void> _loadDashboardData() async {
  final apiService = EchoVaultApiService();
  
  try {
    // Load featured tracks
    final featured = await apiService.getFeaturedTracks(limit: 5);
    setState(() {
      musicVideos = featured.map<Map<String, String>>((item) => {
        'title': item['title']?.toString() ?? '',
        'cover': item['cover']?.toString() ?? 'assets/default.jpeg',
      }).toList();
    });

    // Load active live streams
    final liveStreams = await apiService.getActiveLiveStreams();
    setState(() {
      liveDemos = liveStreams;
    });
  } catch (e) {
    print('Error loading dashboard data: $e');
  }
}
```

**For `TrendingPage.dart` (Explore):**
```dart
@override
void initState() {
  super.initState();
  _loadTrendingTracks();
}

Future<void> _loadTrendingTracks() async {
  final apiService = EchoVaultApiService();
  
  try {
    final trending = await apiService.getTrendingTracks(limit: 20);
    setState(() {
      trendingTracks = trending;
    });
  } catch (e) {
    print('Error loading trending: $e');
  }
}
```

**For `LiveStreamsPage.dart`:**
```dart
@override
void initState() {
  super.initState();
  _loadLiveStreams();
}

Future<void> _loadLiveStreams() async {
  final apiService = EchoVaultApiService();
  
  try {
    final live = await apiService.getLiveStreams(status: 'LIVE', limit: 10);
    setState(() {
      activeStreams = live;
    });
  } catch (e) {
    print('Error loading streams: $e');
  }
}
```

---

## ✅ Testing Checklist

- [ ] Backend running: `npm run dev` at `C:\Users\infin\Desktop\echo-vault-backend`
- [ ] Database connected and populated with `node seed-demo.js`
- [ ] Updated Flutter `AppConfig.dart` with correct base URL
- [ ] Created/updated `EchoVaultApiService.dart` with endpoint methods
- [ ] Updated your screens to call the API service
- [ ] Tested individual endpoints with curl/Postman
- [ ] Run Flutter app and verify data loads on dashboard
- [ ] Test trending page loads trending tracks
- [ ] Test live streams page loads active streams

---

## 🐛 Debugging

**Test endpoints with curl:**
```bash
curl http://localhost:5000/api/tracks/featured
curl http://localhost:5000/api/live/streams/active
```

**Monitor backend logs:**
- Your `npm run dev` terminal shows requests: `GET /api/tracks/featured 200`

**Check Flutter logs:**
- Watch for API errors in your IDE's console
- Use `print()` to debug response data

---

## 🚀 You're Ready!

Your backend is serving perfectly formatted data for your Flutter frontend. Start the backend and test the connection now.

**Next Steps:**
1. Run backend: `npm run dev`
2. Seed data: `node seed-demo.js`
3. Update Flutter AppConfig and services
4. Run Flutter app
5. Verify data loads on dashboard

Questions? Check `BACKEND_ENDPOINTS_GUIDE.md` for complete API reference.
