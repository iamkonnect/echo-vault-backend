# Docker Manager Environment Setup for EchoVault Backend

## Step 1: Set These Environment Variables in Docker Manager

Replace `<your_secure_password>` with a strong password (use the SAME password for both):

```
NODE_ENV=production
PORT=5000
POSTGRES_PASSWORD=<your_secure_password>
DATABASE_URL=postgresql://postgres:<your_secure_password>@db:5432/echo_vault_db?schema=public
JWT_SECRET=<your_jwt_secret_key>
CLIENT_URL=https://admin.echovaultz.com
```

## Step 2: Recreate the Containers

- Click **Redeploy** or **Recreate** in Docker Manager
- Wait 1-2 minutes for containers to start

## Step 3: Verify

Run on VPS:
```bash
docker compose logs app -n 50
```

Should see: "Connected to database" or similar success message

## Step 4: Create Super Admin (if needed)

```bash
cd /docker/echo-vault-backend
npx prisma db push
node create-super-admin.js
```

Then login with:
- Email: akwera@echovaultz.com
- Password: Deandre360xi!
