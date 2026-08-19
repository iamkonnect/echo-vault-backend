# 🚀 EchoVault Admin Dashboard - VPS Deployment Guide

## 📋 Overview

The admin dashboard is a **separate React frontend** at `apps/admin/` that runs independently from the backend API on port 5000.

- **Image:** `iamkonnect/echo-vault-admin:latest` (already published to Docker Hub)
- **Port:** 3000 (nginx)
- **URL:** `https://admin.echovaultz.com`
- **API Endpoint:** `https://api.echovaultz.com/api`
- **Database:** ❌ No database changes (uses existing backend API)

---

## 🔧 Option 1: Deploy Published Image (Recommended - Fastest)

Use the pre-built image from Docker Hub. No building required!

### Prerequisites
```bash
# SSH into VPS
ssh root@187.124.116.216

# Verify Traefik network exists
docker network inspect echo-vault-network > /dev/null 2>&1 || \
    docker network create echo-vault-network

# Verify Docker is running
docker ps
```

### Deploy with Docker Compose

```bash
# Create deployment directory
mkdir -p /opt/echo-vault-admin
cd /opt/echo-vault-admin

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  admin:
    image: iamkonnect/echo-vault-admin:latest
    container_name: echo-vault-admin
    expose:
      - "3000"
    labels:
      - traefik.enable=true
      - traefik.http.routers.echo-vault-admin.rule=Host(`admin.echovaultz.com`)
      - traefik.http.routers.echo-vault-admin.entrypoints=websecure
      - traefik.http.routers.echo-vault-admin.tls=true
      - traefik.http.services.echo-vault-admin.loadbalancer.server.port=3000
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped
    networks:
      - echo-vault-network

networks:
  echo-vault-network:
    external: true
EOF

# Pull latest image
docker pull iamkonnect/echo-vault-admin:latest

# Start service
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs admin
```

### Verify it's working

```bash
# Check container is running
docker ps | grep echo-vault-admin

# Check logs
docker logs echo-vault-admin

# Test health check
curl -I http://localhost:3000/
# Expected: HTTP/1.1 200 OK

# Test Traefik routing
curl -I https://admin.echovaultz.com/
# Expected: HTTP/2 200 (from Traefik)
```

---

## 🔨 Option 2: Build from Source (If you want to customize)

Clone the repo and build on the VPS.

```bash
# SSH into VPS
ssh root@187.124.116.216

# Create work directory
mkdir -p /home/echo-vault
cd /home/echo-vault

# Clone or pull latest
git clone https://github.com/iamkonnect/echo-vault-backend.git
cd echo-vault-backend

# Or if already cloned:
git pull origin master

# Navigate to admin app
cd apps/admin

# Build Docker image
docker build -t iamkonnect/echo-vault-admin:latest .

# Create docker-compose.yml in /opt/echo-vault-admin (see Option 1)
# Then deploy:
docker-compose up -d
```

---

## 📁 Deployment Directory Structure

```
/opt/echo-vault-admin/
├── docker-compose.yml          # Traefik configuration
└── volumes/                     # Optional: for logs
    └── admin-logs/
```

---

## 🔑 Important Notes

### ✅ What Works
- ✅ Admin login: `akwera@echovaultz.com` + password
- ✅ Artist login: `artist@gmail.com` + password
- ✅ Separate sidebars for admin vs artist
- ✅ All dashboard pages and navigation
- ✅ API calls with Authorization header
- ✅ Token stored in localStorage
- ✅ HTTPS via Traefik at `admin.echovaultz.com`

### ❌ What's NOT Affected
- ❌ Backend API still runs on port 5000
- ❌ PostgreSQL database untouched
- ❌ Existing data unchanged
- ❌ No migrations needed

### 🔐 Security
- Token stored in browser localStorage (session-based)
- Authorization header auto-attached to all API requests
- HTTPS enforced via Traefik
- No secrets in Docker image

---

## 🌐 Traefik Configuration Summary

The docker-compose automatically labels the service for Traefik:

```yaml
labels:
  - traefik.enable=true                              # Enable routing
  - traefik.http.routers.echo-vault-admin.rule=Host(`admin.echovaultz.com`)  # Hostname
  - traefik.http.routers.echo-vault-admin.entrypoints=websecure              # HTTPS only
  - traefik.http.routers.echo-vault-admin.tls=true                           # SSL/TLS
  - traefik.http.services.echo-vault-admin.loadbalancer.server.port=3000     # Forward to 3000
```

### Requirements
- Traefik container must be running with Docker socket access
- DNS: `admin.echovaultz.com` must resolve to VPS IP
- SSL certificate auto-provisioned by Traefik (Let's Encrypt)

---

## 📊 Accessing the Dashboard

### Login
```
URL: https://admin.echovaultz.com

ADMIN LOGIN:
Email: akwera@echovaultz.com
Password: [your password]

ARTIST LOGIN:
Email: artist@gmail.com
Password: [your password]
```

### After Login
**Admin View:**
- Dashboard (metrics, quick actions)
- User Directory
- Artist Verification
- Music/Video/Shorts/Ads/Slider Management
- Payouts

**Artist View:**
- Dashboard (stats, recent uploads)
- Upload Song / My Music
- Upload Video / Upload Shorts
- Revenue tracking
- Insights & Live Analytics

---

## 🔄 Updates & Redeployment

When you push new code to GitHub:

```bash
cd /opt/echo-vault-admin

# Pull latest image
docker pull iamkonnect/echo-vault-admin:latest

# Restart service
docker-compose down
docker-compose up -d

# Verify
docker-compose logs admin
```

Or build from source:

```bash
cd /home/echo-vault/echo-vault-backend/apps/admin
git pull origin master
docker build -t iamkonnect/echo-vault-admin:latest .
cd /opt/echo-vault-admin
docker-compose restart
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
docker-compose logs admin
# Check for port conflicts, network issues, or build errors
```

### Can't reach admin.echovaultz.com
```bash
# 1. Check DNS
nslookup admin.echovaultz.com

# 2. Check container is running
docker ps | grep echo-vault-admin

# 3. Check Traefik logs
docker logs traefik

# 4. Check container logs
docker logs echo-vault-admin
```

### Login fails
```bash
# Check backend API is running
curl -I https://api.echovaultz.com/api

# Check browser console (F12) for CORS errors
# Verify backend is accessible from admin container
docker exec echo-vault-admin curl -I https://api.echovaultz.com/api
```

### Health check failing
```bash
# Check nginx is responding
docker exec echo-vault-admin wget -q -O - http://localhost:3000/

# Check nginx config
docker exec echo-vault-admin cat /etc/nginx/conf.d/default.conf
```

---

## 📌 Docker Image Details

**Image Name:** `iamkonnect/echo-vault-admin:latest`

**Build Process:**
1. **Stage 1 (Builder):** `node:20-alpine`
   - Install dependencies: `npm ci`
   - Build React: `npm run build` → creates `/app/dist`
   
2. **Stage 2 (Runtime):** `nginx:alpine`
   - Copy dist to nginx: `/usr/share/nginx/html`
   - Configure nginx for React Router
   - Expose port 3000

**Size:** ~67MB (gzipped: ~67KB)

**Health Check:**
- Command: `wget http://localhost:3000/`
- Interval: 10s
- Timeout: 5s
- Retries: 3

---

## 📝 Environment Variables

Currently, the admin app uses hardcoded API endpoint:
```javascript
const API_BASE = 'https://api.echovaultz.com/api';
```

To make it configurable:
1. Update `src/App.jsx` to read from `window.ENV`
2. Add to nginx config: `echo 'window.ENV = {...}' > /usr/share/nginx/html/env.js`
3. Reference in `index.html`: `<script src="/env.js"></script>`

---

## 📞 Support

- **GitHub:** https://github.com/iamkonnect/echo-vault-backend
- **Docker Hub:** https://hub.docker.com/r/iamkonnect/echo-vault-admin
- **Latest Commit:** `5786065` (Complete artist portal with all sections)

---

**Ready to deploy? Choose Option 1 (fastest) or Option 2 (custom build)! 🚀**
