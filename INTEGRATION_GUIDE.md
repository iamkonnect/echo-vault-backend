# EchoVault Flutter & Backend Integration Guide

## Project Status
✅ **Test Mode** - Running locally with Docker Compose

## Setup Instructions

### 1. Start Backend Services
```bash
cd C:\Users\infin\Desktop\echo-vault-backend
docker-compose up
```

This will:
- Start PostgreSQL on `localhost:5432`
- Start Node.js API on `localhost:5000`
- Initialize database with Prisma

### 2. Configure Flutter App

The Flutter app has been updated with:
- ✅ `auth_service.dart` - Authentication (login/register/logout)
- ✅ `auth_provider.dart` - State management with Riverpod
- ✅ `api_service.dart` - API calls (tracks, albums, recommendations)
- ✅ `artist_service.dart` - Artist-specific endpoints
- ✅ `auth_screen.dart` - Login/Register UI
- ✅ `main.dart` - Navigation based on auth state

### 3. Run Flutter App

#### For Android Emulator:
```bash
flutter run
```
The app will use `http://10.0.2.2:5000` (Android emulator IP for localhost)

#### For iOS Simulator:
```bash
flutter run
```
The app will use `http://localhost:5000`

#### For Web (Development):
```bash
flutter run -d web
```

### 4. Test Authentication Flow

1. **Register a new user:**
   - Name: `Test Artist`
   - Email: `artist@test.com`
   - Password: `password123`

2. **Login:**
   - Use the credentials above
   - JWT token will be stored locally via `shared_preferences`

3. **Access Artist Dashboard:**
   - After login, navigate to `/api/artist/insights`
   - View total plays, earnings, and balance

## API Endpoints Structure

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout (clears token)

### Artist Routes (Protected)
- `GET /api/artist/insights` - Get artist stats
- (Ready for: upload, music library, withdrawals)

### Admin Routes (Protected)
- `GET /api/admin/dashboard` - Platform stats
- `GET /api/admin/users` - User directory
- `POST /api/admin/create-admin` - Add admin user

## Flutter Base URL Configuration

Currently set in `lib/providers/auth_provider.dart`:
```dart
const String baseUrl = 'http://localhost:5000'; // Local testing
```

For **Production**, change to your deployed backend:
```dart
const String baseUrl = 'https://api.echovault.com';
```

## CORS & Networking

✅ Backend updated to accept:
- Flutter on Android emulator (`http://10.0.2.2:*`)
- Flutter on iOS simulator (`http://localhost:*`)
- Web apps on localhost
- Cross-origin requests with credentials

## Database

PostgreSQL credentials (from docker-compose):
- Host: `localhost` (or `db` inside Docker)
- Port: `5432`
- User: `postgres`
- Password: `yourpassword`
- Database: `echo_vault_db`

## Next Steps (After Testing)

1. **Implement missing artist endpoints in backend:**
   - `POST /api/artist/upload` - Music upload
   - `GET /api/artist/music` - Artist's music library
   - `POST /api/artist/withdraw` - Fund withdrawal

2. **Add music search & playback endpoints:**
   - `GET /api/tracks/search` - Search tracks
   - `GET /api/tracks/:id` - Get track details
   - `GET /api/albums/:id` - Get album
   - `GET /api/artists/:id` - Get artist profile

3. **Deploy to Cloud:**
   - When ready, deploy backend to Docker Container Registry
   - Update `baseUrl` in Flutter app
   - No code changes needed—just swap the URL

## Troubleshooting

### Flutter app can't connect to backend:
1. Ensure Docker containers are running: `docker ps`
2. Check backend logs: `docker logs <container_id>`
3. Verify CORS headers in response
4. Use correct base URL for your platform (Android/iOS/Web)

### Database connection issues:
1. Verify PostgreSQL is healthy: `docker-compose ps`
2. Check `DATABASE_URL` in `.env`
3. Run `docker-compose down && docker-compose up --build`

### Authentication token not persisting:
1. Check `shared_preferences` package is installed
2. Verify token is being saved: Check app logs
3. Ensure JWT_SECRET in `.env` matches server

## File Changes Summary

**Flutter App Updates:**
- ✅ Created `lib/services/auth_service.dart`
- ✅ Created `lib/services/artist_service.dart`
- ✅ Updated `lib/services/api_service.dart`
- ✅ Created `lib/providers/auth_provider.dart`
- ✅ Created `lib/screens/auth_screen.dart`
- ✅ Updated `lib/main.dart`

**Backend Updates:**
- ✅ Updated `server.js` - CORS configuration
- ✅ Updated `docker-compose.yml` - Network configuration
- ✅ Ready for new endpoint implementations
