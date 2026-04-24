# EchoVault Complete Testing Guide

## Prerequisites

- Docker & Docker Compose installed
- Postman (optional, for API testing)
- Flutter SDK installed
- Your backend running: `docker-compose up`

---

## Phase 1: Backend Setup & Testing

### 1.1 Start Backend Services

```bash
cd C:\Users\infin\Desktop\echo-vault-backend
docker-compose up
```

Wait for logs to show:
```
EchoVault Server running on port 5000
```

### 1.2 Test with Postman (Recommended)

1. **Import Collection:**
   - Open Postman
   - File → Import → Select `EchoVault_API_Testing.postman_collection.json`

2. **Test Registration:**
   - Click: `Authentication` → `Register Artist`
   - Click: **Send**
   - Expected Response (201):
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "id": "clx...",
         "email": "artist@test.com",
         "name": "Test Artist",
         "role": "ARTIST",
         "walletBalance": 0
       }
     }
     ```

3. **Copy JWT Token:**
   - Copy the `token` value from response
   - Go to `Authorization` tab at top
   - Set Type to `Bearer Token`
   - Paste token in the Token field

4. **Test Artist Endpoints:**
   - `Get Artist Insights` → **Send** ✅
   - `Get Artist Music Library` → **Send** ✅
   - `Get Earnings Breakdown` → **Send** ✅
   - `Get Withdrawal History` → **Send** ✅

5. **Test Withdrawal:**
   - Click: `Request Withdrawal`
   - Body shows `{ "amount": 50.00 }`
   - **Send** → Expected: **201** with transaction details

---

## Phase 2: cURL Command Testing (If No Postman)

### Register & Login

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@test.com",
    "password": "password123",
    "name": "Test Artist",
    "role": "ARTIST"
  }'

# Save the token from response
TOKEN="YOUR_TOKEN_HERE"

# 2. Get Insights
curl -X GET http://localhost:5000/api/artist/insights \
  -H "Authorization: Bearer $TOKEN"

# 3. Request Withdrawal
curl -X POST http://localhost:5000/api/artist/withdraw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.00}'
```

---

## Phase 3: Flutter App Testing

### 3.1 Run Flutter App

```bash
cd C:\Users\infin\Downloads\echovault_working
flutter run
```

Choose platform:
- **Android Emulator** → Press `a`
- **iOS Simulator** → Press `i`
- **Web** → Press `w`

### 3.2 Auth Screen Testing

1. **Register Flow:**
   - Tap "Don't have an account? Register"
   - Enter:
     - Name: `Test Flutter User`
     - Email: `flutter@test.com`
     - Password: `flutter123`
   - Tap **Register**
   - Should navigate to MainScreen ✅

2. **Login Flow:**
   - Go back to login
   - Enter: `flutter@test.com` / `flutter123`
   - Tap **Login**
   - Should navigate to MainScreen ✅

### 3.3 Test Token Persistence

1. **Close and reopen app**
   - App should still be logged in (token persisted)
   - No login screen should appear ✅

2. **Clear app data** (to test logout)
   - Settings → Apps → EchoVault → Clear Cache/Data
   - Reopen → Should show login screen ✅

---

## Phase 4: Full Integration Testing (Flutter + Backend)

### 4.1 Create Artist Dashboard Screen

Add this to Flutter app at `lib/screens/artist_dashboard_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/artist_provider.dart';

class ArtistDashboardScreen extends ConsumerWidget {
  const ArtistDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final artistInsights = ref.watch(artistInsightsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0a0a0a),
      appBar: AppBar(
        title: const Text('Artist Dashboard'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authStateProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: artistInsights.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => Center(child: Text('Error: $error')),
            data: (insights) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats Grid
                GridView.count(
                  shrinkWrap: true,
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  children: [
                    _StatCard(
                      title: 'Total Plays',
                      value: '${insights['totalPlays'] ?? 0}',
                      icon: Icons.play_circle,
                    ),
                    _StatCard(
                      title: 'Total Earnings',
                      value: '\$${(insights['totalEarnings'] ?? 0).toStringAsFixed(2)}',
                      icon: Icons.attach_money,
                    ),
                    _StatCard(
                      title: 'Balance',
                      value: '\$${(insights['currentBalance'] ?? 0).toStringAsFixed(2)}',
                      icon: Icons.wallet,
                      color: Colors.green,
                    ),
                    _StatCard(
                      title: 'Shorts',
                      value: '${(insights['shorts'] as List?)?.length ?? 0}',
                      icon: Icons.video_library,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Withdrawal Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    onPressed: () {
                      _showWithdrawalDialog(context, ref);
                    },
                    child: const Text('Request Withdrawal'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showWithdrawalDialog(BuildContext context, WidgetRef ref) {
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request Withdrawal'),
        content: TextField(
          controller: amountController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(hintText: 'Amount'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              final amount = double.tryParse(amountController.text) ?? 0;
              if (amount > 0) {
                ref.read(withdrawalProvider(amount));
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Withdrawal requested')),
                );
              }
            },
            child: const Text('Request'),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    this.color = Colors.purple,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Icon(icon, color: color, size: 32),
          Text(
            title,
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
```

### 4.2 Create Artist Provider

Add `lib/providers/artist_provider.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/artist_service.dart';

// Get artist insights
final artistInsightsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final artistService = ref.watch(artistServiceProvider);
  final result = await artistService.getArtistInsights();
  if (result['success']) {
    return result['data'];
  } else {
    throw Exception(result['error']);
  }
});

// Request withdrawal
final withdrawalProvider =
    FutureProvider.family<Map<String, dynamic>, double>((ref, amount) async {
  final artistService = ref.watch(artistServiceProvider);
  final result = await artistService.withdrawFunds(amount: amount);
  if (result['success']) {
    // Refresh insights after withdrawal
    ref.refresh(artistInsightsProvider);
    return result['data'];
  } else {
    throw Exception(result['error']);
  }
});

// Get music library
final artistMusicProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final artistService = ref.watch(artistServiceProvider);
  final result = await artistService.getArtistMusic();
  if (result['success']) {
    return result['data'];
  } else {
    throw Exception(result['error']);
  }
});
```

### 4.3 Update Main Screen to Show Dashboard After Login

Update `lib/main.dart` to navigate to dashboard:

```dart
home: authState.isAuthenticated 
  ? ArtistDashboardScreen() 
  : const AuthScreen(),
```

---

## Phase 5: Test Scenarios

### Scenario 1: User Registration & Login
- [ ] Register with new email
- [ ] JWT token received
- [ ] Token saved locally
- [ ] Login with same credentials
- [ ] Token verified
- [ ] Can access protected routes

### Scenario 2: Artist Insights
- [ ] GET /api/artist/insights returns:
  - [ ] totalPlays (int)
  - [ ] totalEarnings (float)
  - [ ] currentBalance (float)
  - [ ] shorts (array)
  - [ ] recentTransactions (array)

### Scenario 3: Withdrawal Flow
- [ ] Request withdrawal with valid amount
- [ ] Transaction created with PENDING status
- [ ] Balance should not change (until admin approves)
- [ ] View withdrawal history
- [ ] See pending withdrawals

### Scenario 4: Error Handling
- [ ] Invalid JWT token → 401 Unauthorized
- [ ] Missing Authorization header → 401
- [ ] Insufficient balance for withdrawal → 400
- [ ] Invalid email/password on login → 401

---

## Troubleshooting

### Backend Issues

**Container won't start:**
```bash
docker-compose down
docker-compose up --build
```

**Database connection error:**
```bash
docker-compose logs db
# Check if postgres is healthy
docker-compose ps
```

**JWT token invalid:**
- Ensure `JWT_SECRET` in `.env` matches `server.js`
- Check token expiration (currently no expiry set)

### Flutter Issues

**Can't connect to backend:**
- Android: Use `http://10.0.2.2:5000` (Android emulator special IP)
- iOS: Use `http://localhost:5000`
- Check backend is running: `docker ps`

**Token not persisting:**
- Check `shared_preferences` is in `pubspec.yaml`
- Run `flutter pub get`

**CORS errors:**
- Check backend CORS configuration in `server.js`
- Ensure `Origin` header is in allowed list

---

## Expected Test Results

| Test | Expected | Status |
|------|----------|--------|
| Register Artist | 201 + JWT | ✅ |
| Login | 200 + JWT | ✅ |
| Get Insights | 200 + Stats | ✅ |
| Request Withdrawal | 201 + Transaction | ✅ |
| Invalid Token | 401 | ✅ |
| Insufficient Balance | 400 | ✅ |

---

## Next Steps After Testing

1. **Implement music upload endpoint** with file handling
2. **Add payment gateway** (Stripe/PayPal) for real withdrawals
3. **Set up admin approval workflow** for withdrawals
4. **Add email notifications** for important events
5. **Deploy to cloud** (AWS, GCP, Azure)
