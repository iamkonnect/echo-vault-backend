# Admin Dashboard Analytics - Complete Documentation

## Overview

The EchoVault Admin Dashboard now includes advanced analytics features with:
- **Date Range Selector** - Preset periods or custom date ranges
- **Export Functionality** - Export data as PDF, CSV, or XML
- **Real-time Analytics** - Platform metrics and revenue insights
- **Top Content Tracking** - Artists, videos, songs, and streams

---

## Features

### 1. Date Range Selector

Located in the top-right of the Platform Analytics section.

#### Preset Options:
- **Last 1 Month** - Previous 30 days
- **Last 3 Months** - Previous 90 days
- **Last 6 Months** - Previous 180 days
- **Last 9 Months** - Previous 270 days
- **Last 1 Year** - Previous 365 days

#### Custom Range:
- Click the dropdown
- Scroll to "Custom Range" section
- Select start date
- Select end date
- Click "Apply"

The display updates immediately and all exports use the selected date range.

### 2. Export Functionality

Click the **"Export"** button to access three export formats.

#### PDF Export
```
- Contains all analytics data
- Landscape orientation (A4 size)
- Includes charts and tables
- Ready to print or share
- File: EchoVault_Analytics_[timestamp].pdf
```

#### CSV Export
```
- Spreadsheet format (Excel/Google Sheets)
- Structured data rows
- Easy to manipulate and analyze
- Includes: Summary metrics, Top artists, Revenue data
- File: EchoVault_Analytics_[daterange].csv
```

#### XML Export
```
- Structured data format
- Machine-readable
- Integration-friendly
- Includes: Metadata, summary, top artists
- File: EchoVault_Analytics_[daterange].xml
```

---

## Data Included in Analytics

### Summary Metrics
```
- Total Users: All registered users
- Active Artists: Users with ARTIST role
- Total Revenue: Sum of all gifts in date range
- Pending Payouts: Number of withdrawal requests
- Active Reports: User reports/complaints
- Total Streams: All song plays in period
```

### Top Artists
```
- Rank (#)
- Artist Name
- Total Streams: Number of plays
- Followers: User followers
- Revenue: Total earnings ($)
```

### Top Videos
```
- Video Title
- Creator Name
- Views: Total views
- Revenue: Generated income
- Created Date
```

### Top Songs
```
- Song Title
- Artist Name
- Plays: Total plays
- Revenue: Generated income
- Created Date
```

### Revenue Breakdown
```
- Gifts: Revenue from gift donations
- Sales: Revenue from direct purchases
- Subscriptions: Subscription revenue (if applicable)
```

### Withdrawals
```
- Artist Name
- Amount: Withdrawal amount
- Status: PENDING, COMPLETED, REJECTED
- Requested Date
```

---

## API Endpoints

### Get Analytics Data
```
GET /api/analytics/data?startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `format` (optional): 'json' (default)

**Response:**
```json
{
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "summary": {
    "totalUsers": 5000,
    "activeArtists": 250,
    "totalRevenue": 50000,
    "pendingWithdrawals": 15,
    "totalWithdrawalAmount": 5000,
    "activeReports": 8,
    "totalStreams": 1000000
  },
  "topArtists": [
    {
      "userId": "artist-1",
      "name": "The Weeknd",
      "email": "artist@example.com",
      "revenue": 25000,
      "giftCount": 500,
      "followers": 10000,
      "walletBalance": 5000
    }
  ],
  "topVideos": [...],
  "topSongs": [...],
  "revenueBreakdown": {...},
  "withdrawals": [...]
}
```

### Export as CSV
```
GET /api/analytics/export/csv?startDate=2024-01-01&endDate=2024-12-31
```

**Returns:** CSV file download

### Export as XML
```
GET /api/analytics/export/xml?startDate=2024-01-01&endDate=2024-12-31
```

**Returns:** XML file download

---

## Frontend Implementation

### Date Range Handling

```javascript
// Current date range object
let currentDateRange = { 
  startDate: new Date(...),  // JavaScript Date object
  endDate: new Date(...)     // JavaScript Date object
};

// Change date range
setDateRange('3months');  // Sets to last 3 months

// Apply custom range
applyCustomRange();  // Uses date inputs from form
```

### Export Functions

```javascript
// Export as PDF
exportPDF()  // Uses html2pdf library

// Export as CSV
exportCSV()  // Uses XLSX library

// Export as XML
exportXML()  // Generates XML structure
```

### JavaScript Libraries Used

**html2pdf.js** - PDF generation
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
```

**XLSX** - CSV/Excel export
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"></script>
```

---

## Usage Examples

### Example 1: Export Last 3 Months as CSV

1. Click on date selector
2. Select "Last 3 Months"
3. Click "Export" button
4. Select "Export as CSV"
5. File downloads: `EchoVault_Analytics_2024-09-15_2024-12-15.csv`

### Example 2: Custom Date Range Export as PDF

1. Click on date selector
2. Scroll to "Custom Range"
3. Select start date: 2024-06-01
4. Select end date: 2024-08-31
5. Click "Apply"
6. Click "Export" button
7. Select "Export as PDF"
8. File downloads: `EchoVault_Analytics_1718876400000_1725084000000.pdf`

### Example 3: Integrate with Backend API

```javascript
async function loadAnalyticsData(startDate, endDate) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const response = await fetch(
    `/api/analytics/data?startDate=${start}&endDate=${end}`
  );
  const data = await response.json();
  
  // Update dashboard with new data
  updateAnalyticsDisplay(data);
}
```

---

## Backend Requirements

### Database Models Needed

Ensure these Prisma models exist:
```prisma
model User { ... }
model Gift { amount Float, receiverId, createdAt, ... }
model Follow { followingId, ... }
model Video { viewCount, revenue, creator, createdAt, ... }
model Song { playCount, revenue, artist, createdAt, ... }
model Withdrawal { amount, status, requestedAt, user, ... }
model Report { status, createdAt, ... }
```

### Required Controllers/Routes

- Authentication middleware: `protect`, `authorize`
- Analytics controller: `analyticsController.js`
- Analytics routes: `analyticsRoutes.js`

### File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── analyticsController.js        [NEW]
│   └── routes/
│       └── analyticsRoutes.js            [NEW]
└── server.js                             [UPDATED]
```

---

## Performance Considerations

### Query Optimization

The analytics queries use:
- **Aggregation** - Fast data summarization
- **Grouping** - Efficient top-N calculations
- **Date filtering** - Range-based queries with indexes
- **Promise.all()** - Parallel query execution

### Caching Strategy

For frequently accessed data:
```javascript
// Cache analytics for 5 minutes
const cacheKey = `analytics_${start}_${end}`;
const cached = cache.get(cacheKey);
if (cached) return cached;

// Fetch and cache
const data = await fetchAnalytics(start, end);
cache.set(cacheKey, data, 300000); // 5 minutes
```

### Database Indexes

Recommended indexes:
```sql
CREATE INDEX idx_gift_createdAt ON gift(createdAt);
CREATE INDEX idx_gift_receiverId ON gift(receiverId);
CREATE INDEX idx_video_createdAt ON video(createdAt);
CREATE INDEX idx_song_createdAt ON song(createdAt);
```

---

## Troubleshooting

### Date Selector Not Working
```
Check: 
1. JavaScript enabled in browser
2. No console errors
3. Date input format (YYYY-MM-DD)
4. Server timezone settings
```

### Export Button Missing
```
Check:
1. CDN links accessible (html2pdf, XLSX)
2. Admin permissions granted
3. Browser allows downloads
4. JavaScript libraries loaded
```

### No Data Showing
```
Check:
1. Date range has data
2. Database connection
3. Server logs for errors
4. Admin dashboard renders
```

### Slow Export
```
Solutions:
1. Reduce date range
2. Optimize database indexes
3. Use background jobs for large exports
4. Implement caching
```

---

## Future Enhancements

### Planned Features
- [ ] Email analytics reports
- [ ] Scheduled exports
- [ ] Data visualization improvements
- [ ] Real-time dashboard updates
- [ ] Custom report builder
- [ ] Comparison analytics (period vs period)
- [ ] Anomaly detection
- [ ] Predictive insights

### Integration Ideas
- BI Tools (Tableau, Power BI)
- Google Sheets add-on
- Slack notifications
- Email delivery
- Database backups

---

## Security Notes

### Access Control
```javascript
// Only admins can access analytics
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'REPORTS_MANAGER']));
```

### Data Privacy
- No personal emails in PDF (use display names)
- Secure download links
- Log all exports
- Rate limit export requests

### File Handling
```javascript
// Sanitize filenames
filename: `Analytics_${Date.now()}.pdf`

// Limit file size
maxSize: 50 * 1024 * 1024  // 50MB

// Auto-delete old files
deleteAfter: 24 * 60 * 60 * 1000  // 24 hours
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check server logs at `npm run dev`
4. Verify database queries with Prisma Studio
5. Test endpoints with Postman/cURL

---

## Summary

The Admin Dashboard now provides:
✅ Flexible date range selection  
✅ Multiple export formats (PDF, CSV, XML)  
✅ Comprehensive platform analytics  
✅ Top content tracking  
✅ Revenue insights  
✅ Export to business intelligence tools  

This allows admins to make data-driven decisions and share insights with stakeholders.

