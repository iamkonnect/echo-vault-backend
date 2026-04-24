# Gift System: Income Model Deep Dive

This document explains how the gift system works end-to-end, connecting frontend, backend, WebSocket, and revenue tracking.

---

## The Gift Flow: Step-by-Step

### Step 1: User Opens Stream
**Frontend (Flutter):**
```dart
// User navigates to artist's live stream
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => GiftStreamScreen(
      streamId: 'stream-123',
      artistId: 'artist-456',
      artistName: 'John Doe',
    ),
  ),
);
```

**What Happens:**
1. Screen initializes `RealtimeService`
2. Gets auth token from `AuthService`
3. Connects WebSocket: `await realtimeService.connect(token)`
4. Joins stream room: `await realtimeService.joinStream(streamId)`
5. Fetches available gifts: `ref.watch(availableGiftsProvider)`
6. Loads artist revenue: `ref.watch(revenueProvider)`

### Step 2: User Sends Gift
**Frontend:**
```dart
// User taps gift card
void _sendGift(Map<String, dynamic> gift) async {
  try {
    final result = await _realtimeService.sendGift(
      receiverId: widget.artistId,
      amount: 10.0,  // $10
      quantity: 1,
      giftId: 'diamond',
      streamId: widget.streamId,
    );
    
    if (result['success']) {
      print('Gift sent!');
    }
  } catch (e) {
    print('Error: $e');
  }
}
```

**WebSocket Emission:**
```javascript
// Socket emits to backend
socket.emit('sendGift', {
  receiverId: 'artist-456',
  amount: 10.0,
  quantity: 1,
  giftId: 'diamond',
  streamId: 'stream-123',
}, (response) => {
  // Response: { success: true, giftId: 'gift-789' }
});
```

### Step 3: Backend Processes Gift
**Backend (socket handler):**
```javascript
socket.on('sendGift', async (giftData, callback) => {
  const { streamId, giftId, quantity, amount, receiverId } = giftData;

  // 1. Create gift record in database
  const gift = await prisma.gift.create({
    data: {
      senderId: user.id,
      receiverId,
      giftId,
      quantity,
      amount,
      streamId: streamId || null,
      createdAt: new Date(),
    },
  });

  // 2. Update artist's wallet
  await prisma.user.update({
    where: { id: receiverId },
    data: {
      walletBalance: {
        increment: amount,  // $10 added
      },
    },
  });

  // 3. Update stream stats
  if (streamId) {
    await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        totalGifts: { increment: quantity },
        totalGiftAmount: { increment: amount },
      },
    });
  }

  // 4. Broadcast to stream viewers
  io.to(`stream:${streamId}`).emit('newGift', {
    senderName: user.name,
    senderId: user.id,
    receiverId,
    giftId,
    quantity,
    amount,
    timestamp: new Date().toISOString(),
  });

  // 5. Callback to sender (confirmation)
  callback?.({
    success: true,
    giftId: gift.id,
    message: 'Gift sent successfully!',
  });

  console.log(`Gift: ${user.id} -> ${receiverId} ($${amount})`);
});
```

### Step 4: Real-time Updates
**Backend Broadcasting:**
```javascript
// All stream viewers see the gift immediately
io.to(`stream:${streamId}`).emit('newGift', {
  senderName: 'John Smith',
  giftId: 'diamond',
  quantity: 1,
  amount: 10,
  totalStreamGifts: 45,
  timestamp: '2024-01-15T10:30:00Z',
});
```

**Frontend Reception:**
```dart
// Listen for incoming gifts
_realtimeService.onGift('stream_gifts', (gift) {
  // UI updates with animation
  setState(() {
    _receivedGifts.insert(0, gift);
  });

  // Show celebration notification
  _showGiftNotification(gift);
});
```

### Step 5: Artist Revenue Update
**Real-time Dashboard Update:**
```dart
// Revenue provider automatically triggers rebuild
final revenueAsync = ref.watch(revenueProvider);

revenueAsync.when(
  data: (revenue) => Column(
    children: [
      // Total earnings updated in real-time
      Text('Total: \$${revenue['totalEarnings']}'),  // $1,250
      Text('Today: \$${revenue['todayEarnings']}'),  // $350
      Text('Wallet: \$${revenue['walletBalance']}'), // $1,250
    ],
  ),
);
```

---

## Database Schema: Gift Records

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String
  walletBalance     Float     @default(0)    // Artist earnings
  
  // Relationships
  sentGifts         Gift[]    @relation("sentGifts")
  receivedGifts     Gift[]    @relation("receivedGifts")
  
  @@index([email])
}

model Gift {
  id                String    @id @default(cuid())
  
  // Sender (gift buyer)
  senderId          String
  sender            User      @relation("sentGifts", fields: [senderId], references: [id])
  
  // Recipient (artist)
  receiverId        String
  receiver          User      @relation("receivedGifts", fields: [receiverId], references: [id])
  
  // Gift details
  giftId            String    // Type: rose, diamond, crown, etc
  quantity          Int       @default(1)
  amount            Float     // Amount in USD ($5, $10, $50, etc)
  
  // Context
  streamId          String?   // Which stream (if any)
  stream            LiveStream? @relation(fields: [streamId], references: [id])
  
  // Metadata
  createdAt         DateTime  @default(now())
  
  @@index([senderId])
  @@index([receiverId])
  @@index([streamId])
  @@index([createdAt])
}

model LiveStream {
  id                String    @id @default(cuid())
  artistId          String
  title             String
  
  // Stream stats (updated in real-time)
  viewerCount       Int       @default(0)
  totalGifts        Int       @default(0)    // Count of gifts
  totalGiftAmount   Float     @default(0)    // Total $ received
  
  // Relationships
  gifts             Gift[]
  
  createdAt         DateTime  @default(now())
}
```

---

## Gift Types & Pricing

```javascript
// Available gifts (should be fetched from backend)
const GIFTS = [
  {
    id: 'rose',
    name: 'Rose',
    icon: '🌹',
    amount: 5,      // $5
    description: 'A beautiful rose'
  },
  {
    id: 'heart',
    name: 'Heart',
    icon: '❤️',
    amount: 10,     // $10
    description: 'Show your love'
  },
  {
    id: 'gift',
    name: 'Gift',
    icon: '🎁',
    amount: 25,     // $25
    description: 'A special gift'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    icon: '💎',
    amount: 50,     // $50
    description: 'Premium gift'
  },
  {
    id: 'crown',
    name: 'Crown',
    icon: '👑',
    amount: 100,    // $100
    description: 'Royal gift'
  },
];
```

---

## Revenue Analytics: Artist Dashboard

### Real-time Revenue Tracking
```dart
final revenueProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final artistService = ref.watch(artistServiceProvider);
  return await artistService.getRevenueData();
});

// Returns:
{
  'totalEarnings': 1250.50,      // All-time total
  'todayEarnings': 350.00,       // Today's income
  'thisWeekEarnings': 1200.00,   // This week
  'thisMonthEarnings': 2500.00,  // This month
  'walletBalance': 1250.50,      // Current balance
  'pendingWithdrawal': 0,        // Requested but not paid
  'lastGift': {                  // Last gift received
    'senderName': 'John Smith',
    'giftId': 'diamond',
    'amount': 50,
    'timestamp': '2024-01-15T10:30:00Z'
  },
  'topGifts': [                  // Most popular gifts today
    { 'giftId': 'heart', 'count': 12, 'total': 120 },
    { 'giftId': 'rose', 'count': 25, 'total': 125 },
  ],
  'viewerStats': {
    'totalViewers': 1500,
    'peakViewers': 250,
    'avgSessionMinutes': 45
  }
}
```

### Artist Dashboard Display
```dart
Widget buildRevenueStats(Map<String, dynamic> revenue) {
  return Column(
    children: [
      // Today's earnings highlight
      Card(
        color: Colors.green.shade800,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              Text('Today\'s Earnings', style: TextStyle(color: Colors.white70)),
              SizedBox(height: 8),
              Text(
                '\$${revenue['todayEarnings']}',
                style: TextStyle(
                  color: Colors.green,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
      
      // Stats grid
      GridView.count(
        crossAxisCount: 2,
        children: [
          StatCard('Total Earnings', '\$${revenue['totalEarnings']}'),
          StatCard('Wallet Balance', '\$${revenue['walletBalance']}'),
          StatCard('This Month', '\$${revenue['thisMonthEarnings']}'),
          StatCard('Avg Session', '${revenue['viewerStats']['avgSessionMinutes']}m'),
        ],
      ),
      
      // Last gift received
      Card(
        child: ListTile(
          title: Text('Last Gift from ${revenue['lastGift']['senderName']}'),
          subtitle: Text('${revenue['lastGift']['giftId']} - \$${revenue['lastGift']['amount']}'),
          trailing: Text(revenue['lastGift']['timestamp']),
        ),
      ),
    ],
  );
}
```

---

## Payout System

### Withdrawal Request Flow
```dart
// Artist requests withdrawal
Future<void> requestWithdrawal() async {
  final amount = 500.0;
  final result = await realtimeService.sendGift(
    // Actually uses artistService.requestWithdrawal
  );
  
  // OR using direct API call
  final artistService = ref.watch(artistServiceProvider);
  final result = await artistService.requestWithdrawal(
    amount: amount,
    bankAccount: 'bank-account-id',
  );
}
```

### Backend Processing
```javascript
// POST /api/artist/withdraw
exports.requestWithdrawal = async (req, res) => {
  const { amount, bankAccount } = req.body;
  const userId = req.user.id;

  // Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user.walletBalance < amount) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient balance',
    });
  }

  // Create withdrawal record
  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId,
      amount,
      bankAccount,
      status: 'PENDING',
      requestedAt: new Date(),
    },
  });

  // Deduct from wallet
  await prisma.user.update({
    where: { id: userId },
    data: {
      walletBalance: {
        decrement: amount,
      },
      pendingWithdrawal: {
        increment: amount,
      },
    },
  });

  res.json({
    success: true,
    withdrawalId: withdrawal.id,
    message: `Withdrawal of $${amount} requested. Processing takes 3-5 business days.`,
  });
};
```

---

## Transaction History

### View Gift History
```dart
final payoutHistoryProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final artistService = ref.watch(artistServiceProvider);
  return await artistService.getPayoutHistory();
});

// Display
payoutHistoryProvider.when(
  data: (payouts) => ListView.builder(
    itemCount: payouts.length,
    itemBuilder: (context, index) {
      final payout = payouts[index];
      return ListTile(
        title: Text('\$${payout['amount']} - ${payout['status']}'),
        subtitle: Text(payout['requestedAt']),
        trailing: Text(payout['method']), // bank_transfer, stripe, etc
      );
    },
  ),
);
```

---

## Metrics & Analytics

### Key Metrics to Track
```dart
{
  'giftsSentByUser': 45,           // Gifts given by current user
  'giftsReceivedByArtist': 250,    // Gifts received this month
  'totalRevenueArtist': 2500.00,   // Artist total earnings
  'averageGiftAmount': 10.00,      // Average gift value
  'largestGiftAmount': 100.00,     // Biggest single gift
  'mostPopularGift': 'rose',       // Most purchased gift type
  'peakGiftingTime': '19:00-21:00', // When most gifts sent
  'conversionRate': 0.15,          // % of viewers who send gift
  'repeatGiftingRate': 0.45,       // % who gift multiple times
}
```

### Frontend Analytics Events
```dart
// Track gift send event
analytics.logEvent(
  name: 'gift_sent',
  parameters: {
    'artist_id': artistId,
    'gift_id': giftId,
    'amount': 10.00,
    'stream_id': streamId,
    'user_type': 'premium', // or 'free'
  },
);

// Track viewer engagement
analytics.logEvent(
  name: 'stream_viewed',
  parameters: {
    'artist_id': artistId,
    'stream_id': streamId,
    'duration_minutes': 45,
    'gifts_received': 12,
    'revenue_generated': 120.00,
  },
);
```

---

## Summary: The Complete Gift Loop

```
USER SENDS GIFT
    ↓
Frontend: _sendGift(gift)
    ↓
WebSocket: emit('sendGift', giftData)
    ↓
Backend: socket.on('sendGift')
    ↓
Database:
  - Create Gift record
  - Increment artist wallet
  - Update stream stats
    ↓
WebSocket: io.to('stream').emit('newGift')
    ↓
Frontend:
  - Show gift animation
  - Update revenue display
  - Play notification sound
    ↓
Artist Dashboard:
  - Real-time earnings update
  - Gift count increment
  - Revenue graph update
    ↓
INCOME GENERATED ✓
```

Every gift transaction is:
- ✓ Tracked in real-time
- ✓ Stored in database
- ✓ Visible to artist immediately
- ✓ Counted toward payouts
- ✓ Included in analytics

This is the monetization core of EchoVault!

