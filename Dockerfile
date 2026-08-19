# Stage 1: Build React Admin App
FROM node:20-alpine AS admin-builder

WORKDIR /app/admin

# Copy admin package files
COPY admin/package*.json ./

# Install dependencies
RUN npm ci

# Copy admin source
COPY admin/index.html ./
COPY admin/vite.config.js ./
COPY admin/src ./src

# Build React app
RUN npm run build

# Stage 2: Build Express Backend
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

# Copy backend package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source
COPY . .

# Copy built React admin app from stage 1
COPY --from=admin-builder /app/admin/dist ./public/admin

# Generate Prisma
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
