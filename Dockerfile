FROM node:20-alpine

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
