# EchoVault API - Testing Guide

## Collection Overview

The EchoVault API collection includes **39 endpoints** organized into 7 categories:
- **Auth** (7 endpoints) - Authentication & authorization
- **Artist** (7 endpoints) - Artist operations & uploads
- **Artist Dashboard** (6 endpoints) - Dashboard views
- **Admin** (10 endpoints) - Administrative functions
- **Analytics** (3 endpoints) - Analytics & exports
- **Tracks** (2 endpoints) - Public track data
- **Live Streams** (3 endpoints) - Live streaming data

---

## Quick Start

### 1. Import Collection & Environment

1. Open Postman
2. Import `EchoVault API.yaml` from `postman/collections/`
3. Import `EchoVault Local.yaml` from `postman/environments/`
4. Select **EchoVault Local** environment from dropdown

### 2. Run Auth Flow (First Time)

1. Go to **Auth** folder
2. Open **Login** request
3. Update credentials if needed:
   ```json
   {
     "email": "artist@example.com",
     "password": "password123"
   }
   ```
4. **Send** - Token auto-saves to environment variables

### 3. Test Other Endpoints

All endpoints are now configured with:
- ✓ **Tests** - Automatic response validation
- ✓ **Examples** - Sample request/response bodies
- ✓ **Environment variables** - {{baseUrl}}, {{token}}, {{artistToken}}, {{adminToken}}

---

## Test Scripts

Each request includes **post-response tests** that validate:

### Auth Endpoints
- Status code (200/201)
- Token presence & format
- User data structure
- Auto-saves tokens to environment

### Artist Endpoints
- Status code (200)
- Valid JSON response
- Data field presence
- User authorization

### Admin Endpoints
- Status code validation
- Success property
- Authorization checks

### Analytics & Tracks
- Status 200
- Valid JSON format
- Data availability

---

## Running Tests

### Option 1: Manual Testing (Postman UI)

1. Select environment **EchoVault Local**
2. Navigate to endpoint
3. Click **Send**
4. View results in **Tests** tab

### Option 2: Collection Runner

1. Click **Runner** (top-left)
2. Select **EchoVault API** collection
3. Select **EchoVault Local** environment
4. Choose test folder (or run all)
5. Click **Run**

**Results** show:
- ✓ Passed tests
- ✗ Failed tests
- Response times
- Status codes

### Option 3: Newman (CLI Testing)

```bash
# Install Newman (one-time)
npm install -g newman

# Run full collection
newman run "postman/collections/EchoVault API.json" \
  -e "postman/environments/EchoVault Local.json"

# Run specific folder
newman run "postman/collections/EchoVault API.json" \
  -e "postman/environments/EchoVault Local.json" \
  --folder "Auth"

# Export HTML report
newman run "postman/collections/EchoVault API.json" \
  -e "postman/environments/EchoVault Local.json" \
  -r html --reporter-html-export report.html
```

---

## Environment Variables

### Current Variables (EchoVault Local)

| Variable | Purpose | Auto-Set |
|----------|---------|----------|
| `{{baseUrl}}` | API root URL | Manual (http://localhost:5000) |
| `{{token}}` | Artist JWT token | Login/Register |
| `{{artistToken}}` | Alias for artist token | Login |
| `{{adminToken}}` | Admin JWT token | Admin Login |

### Setting Admin Token

```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Manually set in Postman
pm.environment.set("adminToken", response.token);
```

---

## Workflow Examples

### Complete Artist Workflow

```
1. Register (or Login)
   ↓
2. Get Insights
   ↓
3. Get Music Library
   ↓
4. Upload Music
   ↓
5. Get Earnings Breakdown
   ↓
6. Request Withdrawal
```

### Admin Verification Flow

```
1. Login as Admin
   ↓
2. Get Unverified Artists
   ↓
3. Get User Detail (select artist)
   ↓
4. Verify Artist
   ↓
5. Get Dashboard Stats
```

### Public Data Access

```
1. Get Trending Tracks
2. Get Featured Tracks
3. Get Live Streams
4. Get Analytics Data
```

---

## Debugging Failed Tests

### Check Response
1. Send request
2. View **Body** tab → Response
3. Check `pm.response.json()` structure

### View Test Details
1. Click **Tests** tab
2. Expand failed test
3. Read error message

### Common Issues

#### "Response has token" fails
- Verify credentials in request body
- Check API server is running
- Look at response status code

#### "Status code is 200" fails
- Check response status (might be 400/401/500)
- Review request body
- Verify authorization header

#### "Response is valid JSON" fails
- Check Content-Type header
- Verify response body is JSON
- Check for HTML error responses

---

## Advanced Testing

### Running Before/After Scripts

**Pre-request setup:**
```javascript
// postman-config.js
pm.environment.set("requestTime", new Date().getTime());
```

**Post-response cleanup:**
```javascript
// Validate response time
const elapsed = new Date().getTime() - pm.environment.get("requestTime");
pm.test(`Response time under 1s`, function() {
  pm.expect(elapsed).to.be.below(1000);
});
```

### Custom Test Assertions

Add to any request's **Tests** tab:
```javascript
// Check specific field values
pm.test("User email matches", function() {
  const json = pm.response.json();
  pm.expect(json.user.email).to.equal("artist@example.com");
});

// Array validation
pm.test("Has at least 1 track", function() {
  const json = pm.response.json();
  pm.expect(json.data).to.be.an("array");
  pm.expect(json.data.length).to.be.greaterThan(0);
});

// Data type checks
pm.test("Revenue is a number", function() {
  const json = pm.response.json();
  pm.expect(json.data.totalRevenue).to.be.a("number");
});
```

---

## Collection Maintenance

### Adding New Endpoints

1. Create `.request.yaml` in appropriate folder
2. Include structure:
   ```yaml
   $kind: http-request
   name: Endpoint Name
   method: GET|POST|PUT|DELETE
   url: '{{baseUrl}}/api/path'
   headers:
     - key: Content-Type
       value: application/json
     - key: Authorization
       value: Bearer {{token}}
   body:
     type: json
     content: |-
       { ... }
   scripts:
     - type: afterResponse
       language: text/javascript
       code: |-
         pm.test("Status code is 200", function () {
           pm.response.to.have.status(200);
         });
   ```
3. Run `node postman/enhance_collection.js` to add tests

### Updating Test Scripts

1. Open request in Postman
2. Edit **Tests** tab
3. Save (Ctrl+S)
4. Re-export collection

---

## Performance Testing

### Load Testing with Newman

```bash
# Run collection 10 times
newman run collection.json -e environment.json -n 10 -r cli

# With delay between iterations
newman run collection.json -e environment.json -n 10 --delay 2000
```

### Response Time Monitoring

Add to test scripts:
```javascript
pm.test("Performance: Response time < 500ms", function() {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      api:
        image: echov-api:latest
        ports:
          - 5000:5000
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run API Tests
        run: |
          newman run postman/collections/EchoVault\ API.json \
            -e postman/environments/EchoVault\ Local.json \
            -r junit --reporter-junit-export results.xml
      
      - name: Publish Results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: results.xml
```

---

## Troubleshooting

### Server Not Running?
```bash
# Start development server
npm run dev

# Or with Docker
docker-compose up
```

### Port 5000 Already in Use?
```bash
# Find process using port
lsof -i :5000

# Update baseUrl in environment to different port
# e.g., http://localhost:3000
```

### Token Expired?
```javascript
// Refresh token script
if (pm.response.code === 401) {
  // Token expired, re-login
  const loginRequest = {
    url: pm.environment.get("baseUrl") + "/api/auth/login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    body: {
      mode: "raw",
      raw: JSON.stringify({
        email: pm.environment.get("userEmail"),
        password: pm.environment.get("userPassword")
      })
    }
  };
  
  pm.sendRequest(loginRequest, (err, response) => {
    pm.environment.set("token", response.json().token);
  });
}
```

---

## Resources

- **Postman Docs**: https://learning.postman.com
- **API Server**: http://localhost:5000
- **Postman Collection Spec**: https://schema.postman.com
- **Newman CLI**: https://github.com/postmanlabs/newman

---

**Last Updated**: 2024
**Collection Version**: 2.0
**API Version**: 1.0
