# EchoVault Advanced Features Implementation

## Overview
This document covers the implementation of WebSocket support, JWT token refresh, offline caching, and CI/CD pipelines for EchoVault's full-stack deployment.

---

## Table of Contents
1. [WebSocket & Real-time Features](#websocket--real-time-features)
2. [Token Refresh & Security](#token-refresh--security)
3. [Offline Caching](#offline-caching)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [APK Build Configuration](#apk-build-configuration)
6. [Gift System Integration](#gift-system-integration-income-model)

---

## WebSocket & Real-time Features

### Overview
EchoVault uses **Socket.io** for real-time features:
- **Live streaming** with viewer tracking
- **Gift system** (monetization core)
- **Chat messages** (stream and direct)
- **Notifications** (gifts, follows, comments)

### Backend Implementation

**File:** `src/utils/socketHandlers.js`

```javascript
// Setup in server.js
const setupSocketHandlers = require('./src/utils/socketHandlers');
const socketState = setupSocketHandlers(io);
```

#### Key Features:

1. **Socket Authentication**
   - Tokens are verified on connection
   - Invalid tokens are rejected immediately
   - Real-time user tracking

2. **Stream Events**
   - `joinStream(streamId)` - Join live stream with viewer count
   - `leaveStream(streamId)` - Leave stream, update count
   - Broadcasting viewer updates

3. **Gift Events (Primary Income)**
   - `sendGift(giftData)` - Send gift to artist
   - Updates wallet balance immediately
   - Broadcasts to stream/recipient
   - Database persistence

4. **Chat Events**
   - Stream chat with persistence
   - Direct messaging
   - Real-time delivery

5. **Notifications**
   - Push to specific users
   - Real-time delivery
   - Database storage

### Frontend Implementation

**File:** `lib/services/realtime_service.dart`

#### Connection:

```dart
final realtimeService = RealtimeService();

// Connect with token
await realtimeService.connect(token);

// Join stream
await realtimeService.joinStream(streamId);

// Listen for gifts
realtimeService.onGift('key', (gift) {
  print('Received gift: ${gift['amount']}');
});

// Send gift
await realtimeService.sendGift(
  receiverId: artistId,
  amount: 10.0,
  quantity: 1,
  giftId: 'rose',
  streamId: streamId,
);
```

#### Using with Riverpod:

```dart
// Watch WebSocket connection state
final connectionState = ref.watch(wsConnectionProvider);

// Watch incoming gifts
final gifts = ref.watch(giftsStreamProvider);

// Watch messages
final messages = ref.watch(messagesStreamProvider);

// Watch notifications
final notifications = ref.watch(notificationsStreamProvider);
```

---

## Token Refresh & Security

### Overview
Implements automatic JWT token refresh to maintain secure, uninterrupted sessions.

### Backend Endpoints

**New endpoints in `/api/auth`:**

1. **POST `/api/auth/refresh`**
   - Send: `{ "token": "old_token" }`
   - Returns: New token + user data
   - Returns 401 if token expired

2. **POST `/api/auth/verify`**
   - Protected endpoint
   - Verify current auth status
   - Returns: User data

### Frontend Implementation

**File:** `lib/services/token_refresh_service.dart`

#### Features:

1. **Automatic Refresh**
   - Checks token expiration before each request
   - Automatically refreshes if within 5 minutes of expiry
   - Queues requests during refresh

2. **Manual Refresh**
   ```dart
   final tokenService = ref.watch(tokenRefreshServiceProvider);
   
   // Refresh token
   bool success = await tokenService.refreshToken();
   
   // Check if expired/expiring
   bool needsRefresh = tokenService.isTokenExpiredOrExpiring();
   
   // Get token info
   final info = tokenService.getTokenInfo();
   print(info); // { hasToken: true, expiresAt: ..., isExpired: false }
   ```

3. **401 Handling**
   - Interceptor catches 401 responses
   - Automatically attempts refresh
   - Retries original request
   - Redirects to login if refresh fails

### Integration with ApiClient

```dart
// Token refresh is handled automatically
// Just use the API client normally

final response = await apiClient.get('/api/user/profile');
// If token expired -> auto refresh -> retry -> success
```

---

## Offline Caching

### Overview
Uses **Hive** local database for seamless offline functionality.

### File Structure

**Main service:** `lib/services/cache_service.dart`

### Features:

#### 1. **API Response Caching**
```dart
final cacheService = await ref.watch(cacheServiceProvider.future);

// Cache data with TTL
await cacheService.cacheData(
  'trending_tracks',
  {'tracks': tracksList},
  ttl: Duration(hours: 24),
);

// Retrieve cached data
final cached = cacheService.getCachedData('trending_tracks');
```

#### 2. **User Profile Caching**
```dart
// Save user after login
await cacheService.saveUserProfile(user);

// Get offline profile
final profile = cacheService.getUserProfile();
```

#### 3. **Liked Tracks**
```dart
// Add to offline liked tracks
await cacheService.addLikedTrack(track);

// Get all liked tracks (offline)
final liked = cacheService.getLikedTracks();

// Remove liked track
await cacheService.removeLikedTrack(trackId);
```

#### 4. **Playlist Caching**
```dart
// Cache playlists
await cacheService.cachePlaylists(playlistsList);

// Get cached playlists
final playlists = cacheService.getCachedPlaylists();
```

#### 5. **App Settings**
```dart
// Save setting
await cacheService.saveSetting('autoplay', true);

// Get setting
final autoplay = cacheService.getSetting<bool>('autoplay', defaultValue: true);
```

### Automatic Caching in Providers

Providers automatically cache responses:

```dart
final trendingTracksProvider = FutureProvider<List<...>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  final cacheService = await ref.watch(cacheServiceProvider.future);
  
  // Check cache first
  final cached = cacheService.getCachedData('trending_tracks');
  if (cached != null) {
    return List<Map<String, dynamic>>.from(cached['tracks']);
  }
  
  // Fetch from API and cache
  final tracks = await apiService.getTrendingTracks();
  await cacheService.cacheData('trending_tracks', {'tracks': tracks});
  
  return tracks;
});
```

### Offline Experience

1. **User Login (online)**
   - Cache user profile
   - Cache initial feed

2. **Connection Lost**
   - Use cached data
   - Queue gift/message sends
   - Show "offline mode" indicator

3. **Reconnect**
   - Sync queued actions
   - Refresh caches
   - Update UI with new data

---

## CI/CD Pipeline

### Overview
GitHub Actions automated build, test, and deploy pipeline.

**File:** `.github/workflows/build-deploy.yml`

### Jobs

#### 1. **Build Backend**
- Build Docker image
- Push to GitHub Container Registry
- Tagging strategy:
  - Branch name
  - Semantic version
  - Git SHA

#### 2. **Build Web**
- Setup Flutter
- Get dependencies
- Build web release
- Upload artifact

#### 3. **Build APK**
- Setup Java & Flutter
- Build debug APK
- Build release APK
- Upload artifacts

#### 4. **Tests**
- Backend tests (with PostgreSQL)
- Flutter tests
- Code coverage (optional)

#### 5. **Security Scan**
- Trivy vulnerability scan
- SARIF upload to GitHub Security tab

#### 6. **Deploy**
- Dev deployment (on every push to develop)
- Prod deployment (on tags)
- SSH deployment script

### Usage

#### For APK Release:

```bash
# Create git tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will:
# 1. Build APK (debug & release)
# 2. Run tests
# 3. Run security scan
# 4. Deploy to production
# 5. Create GitHub Release with APK files
```

#### Manual Trigger:

```bash
# Push to branch
git push origin main

# View workflow status
# GitHub Actions -> build-deploy.yml -> running
```

### Artifacts

- **APK Builds:** `apk-builds/app-debug.apk` & `app-release.apk`
- **Web Build:** `flutter-web-build/` directory
- **Docker Images:** `ghcr.io/username/echo-vault-api:main`

---

## APK Build Configuration

### Local APK Build

```bash
cd echovault_working

# Debug APK
flutter build apk --debug
# Output: build/app/outputs/flutter-apk/app-debug.apk

# Release APK
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Signing APK (for Play Store)

1. **Generate keystore:**
```bash
keytool -genkey -v -keystore ~/echo_vault.jks \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure pubspec.yaml:**
```yaml
# Not needed for CI/CD as GitHub Actions handles it
```

3. **Build signed APK:**
```bash
flutter build apk --release \
  --android-key-store=true \
  --android-key=~/echo_vault.jks \
  --android-keystore-password=yourpass \
  --android-key-alias=key-alias \
  --android-key-password=yourpass
```

### App Configuration

**File:** `android/app/build.gradle`

Key settings:
- `minSdkVersion: 21` (Android 5.0+)
- `compileSdkVersion: 34` (Android 14)
- `targetSdkVersion: 34`

---

## Gift System Integration (Income Model)

### Overview
Gifts are the primary monetization mechanism in EchoVault. Every gift transaction:
1. Deducts from sender's wallet
2. Credits to artist/recipient's wallet
3. Recorded in database for analytics
4. Broadcasted in real-time
5. Visible in revenue dashboard

### Database Schema

```javascript
// Gift model (Prisma)
model Gift {
  id            String   @id @default(cuid())
  senderId      String   @db.ObjectId
  sender        User     @relation("sentGifts", fields: [senderId], references: [id])
  receiverId    String   @db.ObjectId
  receiver      User     @relation("receivedGifts", fields: [receiverId], references: [id])
  giftId        String   // Type of gift (rose, diamond, etc)
  quantity      Int      @default(1)
  amount        Float    // Amount in USD
  streamId      String?  @db.ObjectId
  stream        LiveStream? @relation(fields: [streamId], references: [id])
  createdAt     DateTime @default(now())
}

// User wallet
model User {
  ...
  walletBalance Float    @default(0)
  ...
}
```

### Backend Gift API

#### Send Gift (WebSocket)
```javascript
socket.emit('sendGift', {
  receiverId: 'artist-id',
  giftId: 'rose',
  quantity: 1,
  amount: 5.0,
  streamId: 'stream-id' // optional
}, (response) => {
  // { success: true, giftId: '...', message: '...' }
});
```

#### Available Gifts
```javascript
socket.emit('getAvailableGifts', {}, (response) => {
  // { success: true, gifts: [...] }
});
```

### Frontend Gift Integration

#### Send Gift:
```dart
// From GiftStreamScreen
await realtimeService.sendGift(
  receiverId: widget.artistId,
  amount: 10.0,
  quantity: 1,
  giftId: 'diamond',
  streamId: widget.streamId,
);
```

#### Display Available Gifts:
```dart
final giftsAsync = ref.watch(availableGiftsProvider);

giftsAsync.when(
  data: (gifts) => GridView.builder(
    itemCount: gifts.length,
    itemBuilder: (context, index) {
      final gift = gifts[index];
      return GiftCard(gift: gift);
    },
  ),
  loading: () => CircularProgressIndicator(),
  error: (err, stack) => Text('Error: $err'),
);
```

#### Track Revenue:
```dart
final revenueAsync = ref.watch(revenueProvider);

revenueAsync.when(
  data: (revenue) => Column(
    children: [
      Text('Total Earnings: \$${revenue['totalEarnings']}'),
      Text('Today: \$${revenue['todayEarnings']}'),
      Text('Wallet: \$${revenue['walletBalance']}'),
    ],
  ),
  loading: () => CircularProgressIndicator(),
  error: (err, stack) => Text('Error: $err'),
);
```

### Example Flow

1. **User visits artist's live stream**
   - Connects via WebSocket
   - Joins stream room
   - Selects gift to send

2. **User sends gift**
   - Frontend: `sendGift(receiverId, amount, giftId, streamId)`
   - Backend: Creates gift record, updates wallet
   - Database: Logs gift transaction
   - WebSocket: Broadcasts to stream viewers

3. **Artist receives notification**
   - Real-time notification on stream
   - Wallet balance updates instantly
   - Gift animation/celebration
   - Chat message showing gift

4. **Revenue tracking**
   - Dashboard shows instant income
   - Analytics updated in real-time
   - Payout history records transaction

---

## Deployment Checklist

### Before Production
- [ ] Add environment secrets to GitHub:
  - `DEPLOY_KEY` - SSH private key
  - `DEV_DEPLOY_HOST` - Dev server IP
  - `PROD_DEPLOY_HOST` - Prod server IP
  - `DEV_DEPLOY_USER` - SSH user
  - `PROD_DEPLOY_USER` - SSH user

- [ ] Configure Firebase (optional)
  - Push notifications
  - Analytics
  - Crash reporting

- [ ] Set up monitoring
  - Error tracking (Sentry)
  - Performance monitoring
  - User analytics

- [ ] Database backup plan
  - Daily backups
  - Point-in-time recovery
  - Cross-region replication

### Post-Deployment
- [ ] Test all gift transactions
- [ ] Verify WebSocket connections
- [ ] Test offline caching
- [ ] Verify token refresh on 401
- [ ] Monitor server logs
- [ ] Check database performance

---

## Troubleshooting

### WebSocket Connection Issues
```
Error: Socket connection timeout
→ Check firewall/proxy blocking WebSocket
→ Verify CORS in server.js
→ Check token expiration
```

### APK Build Failures
```
Error: Could not find Android SDK
→ Set ANDROID_HOME environment variable
→ Run `flutter doctor -v` to diagnose

Error: Gradle build failed
→ Run `flutter clean`
→ Update gradle: `cd android && ./gradlew wrapper --gradle-version 8.4`
```

### Token Refresh Loop
```
Infinite 401 -> refresh -> 401
→ Check JWT_SECRET matches
→ Verify token expiration time
→ Check clock sync on server
```

### Cache Not Working
```
Offline mode shows old data
→ Clear app cache: `cacheService.clearAllCache()`
→ Check Hive box initialization
→ Verify cache TTL settings
```

---

## Next Steps

1. **Payment Integration**
   - Connect to Stripe/PayPal
   - Handle real money transactions
   - Withdrawal requests

2. **Analytics Dashboard**
   - Gift statistics
   - Revenue trends
   - User engagement metrics

3. **Push Notifications**
   - Firebase Cloud Messaging
   - Gift alerts
   - Stream notifications

4. **Social Features**
   - Follow system
   - Comments/reactions
   - Share to social media

