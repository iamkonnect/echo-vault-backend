# 🚀 QUICK DEPLOYMENT - Copy & Paste Ready

## One-Command Deploy (Use Published Image)

```bash
# SSH to VPS
ssh root@187.124.116.216

# Ensure network exists
docker network inspect echo-vault-network > /dev/null 2>&1 || \
    docker network create echo-vault-network

# Create deployment directory
mkdir -p /opt/echo-vault-admin && cd /opt/echo-vault-admin

# Get latest docker-compose.yml from repo
curl -o docker-compose.yml https://raw.githubusercontent.com/iamkonnect/echo-vault-backend/master/apps/admin/docker-compose.yml

# Pull and run
docker-compose up -d

# Verify
docker-compose ps
docker-compose logs admin
```

## Verify it works

```bash
# Check container
docker ps | grep echo-vault-admin

# Check health
curl -I http://localhost:3000/

# Check Traefik routing
curl -I https://admin.echovaultz.com/
```

## Image Details

- **Image:** `iamkonnect/echo-vault-admin:latest`
- **Port:** 3000
- **URL:** `https://admin.echovaultz.com`
- **No Database:** Uses only the backend API
- **No Data Changes:** Read-only to existing infrastructure

## Login Credentials

```
Admin:  akwera@echovaultz.com / [password]
Artist: artist@gmail.com / [password]
```

## Rollback (if needed)

```bash
# Stop current service
cd /opt/echo-vault-admin
docker-compose down

# Remove image (optional)
docker rmi iamkonnect/echo-vault-admin:latest

# Delete deployment directory
rm -rf /opt/echo-vault-admin
```

## Files Available

- **Docker Image:** `iamkonnect/echo-vault-admin:latest` (Docker Hub)
- **Dockerfile:** `apps/admin/Dockerfile`
- **docker-compose.yml:** `apps/admin/docker-compose.yml`
- **Full Guide:** `ADMIN_DEPLOYMENT_GUIDE.md`
- **Deploy Script:** `DEPLOY_ADMIN.sh`

## Architecture

```
Client Browser
    ↓
https://admin.echovaultz.com (Traefik SSL)
    ↓
Traefik Load Balancer
    ↓
Docker Container (nginx:alpine)
    ↓ :3000
React Admin App (iamkonnect/echo-vault-admin:latest)
    ↓
API Calls → https://api.echovaultz.com/api (Backend)
    ↓
PostgreSQL (unchanged)
```

---

**Status:** ✅ Ready to deploy. No code changes needed on VPS.
