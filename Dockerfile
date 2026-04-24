FROM node:18-alpine

WORKDIR /app

# Install OpenSSL 1.1 required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]