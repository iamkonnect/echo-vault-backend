# Complete Dependencies List

## Backend (Node.js) - package.json

### Core Framework
```json
"express": "^4.18.2"              // Web framework
"cors": "^2.8.5"                  // CORS middleware
"helmet": "^7.1.0"                // Security headers
"morgan": "^1.10.0"               // HTTP logging
"dotenv": "^16.3.1"               // Environment variables
```

### Database & ORM
```json
"@prisma/client": "^5.7.1"        // Database client
"prisma": "^5.7.1"                // ORM & migrations
```

### Real-time & WebSocket
```json
"socket.io": "^4.7.4"             // WebSocket library
"http": "^0"                      // Node HTTP module
```

### Authentication & Security
```json
"jsonwebtoken": "^9.0.2"          // JWT tokens
"bcryptjs": "^2.4.3"              // Password hashing
"cookie-parser": "^1.4.6"         // Cookie parsing
```

### File Handling
```json
"multer": "^1.4.5-lts.1"          // File uploads
```

### Template Engine (for dashboards)
```json
"ejs": "^3.1.10"                  // EJS templating
```

### Development
```json
"nodemon": "^3.0.2"               // Dev auto-reload
```

### Installation
```bash
cd echo-vault-backend
npm install socket.io socket.io-client  # WebSocket support
npm install                             # All dependencies
```

---

## Frontend (Flutter) - pubspec.yaml

### Core Flutter
```yaml
flutter:
  sdk: flutter
```

### State Management
```yaml
flutter_riverpod: ^2.5.1          # Riverpod provider system
```

### Routing
```yaml
go_router: ^14.2.7                # Navigation routing
```

### HTTP & API
```yaml
dio: ^5.7.0                       # HTTP client
http: ^1.2.2                      # HTTP package
socket_io_client: ^2.0.2          # WebSocket client (NEW)
```

### Local Storage & Caching
```yaml
hive: ^2.2.3                      # Local database
hive_flutter: ^1.1.0              # Hive Flutter integration
shared_preferences: ^2.3.2        # SharedPreferences
flutter_secure_storage: ^9.0.0    # Encrypted storage (NEW)
```

### Image & Media
```yaml
cached_network_image: ^3.4.1      # Image caching
video_player: ^2.9.2              # Video playback
chewie: ^1.7.5                    # Video player UI
path_provider: ^2.1.4             # File paths
```

### Audio
```yaml
just_audio: ^0.9.40               # Audio player
just_audio_background: ^0.0.1-beta.11  # Background audio
audio_service: ^0.18.13           # Audio service
```

### Permissions
```yaml
permission_handler: ^11.3.1       # App permissions
```

### Device Info
```yaml
device_info_plus: ^10.1.2         # Device information
connectivity_plus: ^6.0.5         # Network connectivity
package_info_plus: ^8.0.2         # Package info
```

### Notifications
```yaml
flutter_local_notifications: ^17.2.3  # Local notifications
```

### Utilities
```yaml
intl: ^0.19.0                     # Internationalization
url_launcher: ^6.3.0              # URL launcher
share_plus: ^10.0.2               # Share functionality
async: ^2.11.0                    # Async utilities (NEW)
logger: ^2.0.1                    # Logging (NEW)
```

### Localization
```yaml
flutter_localizations:
  sdk: flutter
```

### Development Dependencies
```yaml
flutter_test:
  sdk: flutter
flutter_lints: ^4.0.0             # Linting
hive_generator: ^2.0.1            # Hive code generation
build_runner: ^2.4.12             # Code generation
flutter_launcher_icons: ^0.13.1   # App icons
```

### Installation
```bash
cd echovault_working
flutter pub get                    # Get all dependencies
flutter pub run build_runner build --delete-conflicting-outputs  # Generate code
```

---

## Docker & DevOps

### Docker Images Used
```yaml
postgres:16-alpine                # PostgreSQL database
dpage/pgadmin4:latest            # PgAdmin database UI
```

### Docker Build
```dockerfile
# Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
```

### CI/CD
```yaml
GitHub Actions (build-deploy.yml)
- ubuntu-latest for builds
- docker/setup-buildx-action
- docker/login-action
- docker/build-push-action
- subosito/flutter-action (Flutter setup)
- actions/setup-java-action (Java for Android)
```

---

## System Requirements

### Minimum
- **OS:** Windows 10, macOS 10.15, Linux (Ubuntu 20.04+)
- **RAM:** 8 GB
- **Storage:** 50 GB free space
- **Network:** 1 Mbps (minimum)

### Recommended
- **OS:** Windows 11, macOS 13+, Linux (Ubuntu 22.04+)
- **RAM:** 16 GB
- **Storage:** 100 GB SSD
- **Network:** 10 Mbps+
- **GPU:** Optional (for faster builds)

---

## Software Prerequisites

### Required
```bash
# Node.js & npm
node --version        # v18.0.0+
npm --version         # v8.0.0+

# Flutter & Dart
flutter --version     # v3.24.0+
dart --version        # v3.4.4+

# Java (for Android builds)
java -version         # JDK 17+

# Git
git --version         # v2.30+
```

### Database
```bash
# PostgreSQL (local development or Docker)
psql --version        # v14+

# Docker & Docker Compose (for containerized development)
docker --version      # v20.10+
docker-compose --version  # v1.29+ or v2.0+
```

### IDEs/Editors (Optional)
- **Backend:** VS Code, WebStorm, Visual Studio
- **Frontend:** VS Code, Android Studio, Xcode
- **Database:** pgAdmin 4, DataGrip, DBeaver

---

## Version Compatibility Matrix

| Component | Version | Compatibility |
|-----------|---------|---|
| Node.js | 18+ | ✅ Recommended |
| Flutter | 3.24.0+ | ✅ Required |
| Dart | 3.4.4+ | ✅ Required |
| PostgreSQL | 14+ | ✅ Required |
| Docker | 20.10+ | ✅ For deployment |
| GitHub Actions | latest | ✅ Always supported |

---

## Optional Enhancements

### Payment Processing
```bash
npm install stripe-sdk    # Stripe backend
flutter pub add stripe_sdk # Stripe Flutter
```

### Push Notifications
```bash
npm install firebase-admin     # Firebase backend
flutter pub add firebase_messaging # Firebase Flutter
```

### Analytics
```bash
npm install mixpanel        # Analytics backend
flutter pub add firebase_analytics # Analytics Flutter
```

### Error Tracking
```bash
npm install @sentry/node    # Sentry backend
flutter pub add sentry_flutter # Sentry Flutter
```

---

## Verification

After installation, verify all components:

```bash
# Backend verification
cd echo-vault-backend
npm list socket.io          # ✓ Should show version
npm list @prisma/client     # ✓ Should show version
npm list jsonwebtoken       # ✓ Should show version

# Frontend verification
cd ../echovault_working
flutter pub list            # Lists all packages
flutter doctor -v           # Full diagnostic report

# System verification
docker --version            # Should show version
docker-compose --version    # Should show version
```

---

## Troubleshooting Dependencies

### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm package-lock.json
npm install
```

### Flutter dependencies fail
```bash
# Clear Flutter cache
flutter clean

# Upgrade Flutter
flutter upgrade

# Get dependencies
flutter pub get
flutter pub outdated
```

### Port conflicts
```bash
# Check port 5000 (backend)
lsof -i :5000

# Check port 5432 (database)
lsof -i :5432

# Kill process if needed
kill -9 <PID>
```

---

## Next Steps

1. Install all dependencies
2. Run setup scripts: `./setup-advanced.sh` (or `.bat`)
3. Start backend: `npm run dev`
4. Start frontend: `flutter run -d chrome`
5. View logs and test features

All features are now integrated and ready for development! 🚀

