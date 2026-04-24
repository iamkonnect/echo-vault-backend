# EchoVault Backend - Admin Payouts Revenue Tracking Implementation
## Approved Plan: Backend-focused Admin Web Panel (/api/admin/payouts)
**Priority**: Web Admin (EJS payouts page) - show collected revenue, payout management, platform bank withdrawal button.

## Step-by-Step Implementation (Complete one by one)

### Step 1: ✅ Create this TODO.md [DONE]

### Step 2: ✅ Fix & Enhance payouts page rendering [DONE]
- **File**: `src/controllers/adminController.js` - Updated renderPayoutsPage(): template 'payouts', nextPayoutDate, payouts reshaping (artistName), revenueBreakdown (gifts parsed, others placeholder).
- Test: Visit /api/admin/payouts after server restart - shows revenue collected, payouts table.

### Step 3: ✅ Add payout approve/reject endpoints [DONE]
- Created `src/controllers/adminPayoutController.js`: approvePayout (atomic update status + deduct wallet), rejectPayout.
- Added routes in `src/routes/adminRoutes.js`: GET /payouts, POST /payouts/:id/approve|reject.
- Test: POST to endpoints or use payouts.ejs buttons (after Step 4).

### Step 4: ✅ Add platform bank withdrawal [DONE]
- Added platformWithdraw to adminPayoutController.js: checks revenue, creates PLATFORM WITHDRAWAL.
- Route: POST /platform-withdraw in adminRoutes.js.
- payouts.ejs: Revenue display (breakdown), Withdraw button + modal form, approve/reject buttons JS wired to endpoints.
- Test: payouts page -> Bank Withdraw -> submit form.

### Step 5: Enhance revenue deduction hooks (auto PLATFORM_FEE)
- **File**: Gift creation route (artistRoutes/live.js?)
- On new Gift: create Transaction PLATFORM_FEE = amount * 0.10 (default 10%).
- Update stats to breakdown by source.

### Step 6: Seed test data & update TODO
- Run `node seed.js` with sample revenue/payouts.
- Update TODO.md ✅ marks.
- Test full flow: Admin login -> payouts -> approve artist payout -> platform withdraw.

### Step 7: Minor Polishes
- Flutter admin_dashboard: Add payouts button (optional).
- Dashboard stats: Show breakdown pie.

**Current Progress**: 1/7 [Start Step 2]

**Post-Completion**: `attempt_completion` with test commands.

