# Sober Start

Expo app + Express/Prisma API for sobriety tracking (auth + user-owned journal entries).

## Run locally (easiest)

1. Install root deps:
```bash
npm install
```
2. Install server deps:
```bash
npm --prefix server install
```
3. Start app and API together:
```bash
npm run dev
```

This starts:
- Expo dev server
- API on `http://localhost:4000`

## API base URL

Frontend reads `EXPO_PUBLIC_API_BASE_URL` if set. If not set:
- web/iOS simulator uses `http://localhost:4000`
- Android emulator uses `http://10.0.2.2:4000`

For a physical phone on the same Wi-Fi, set your machine LAN IP:
```bash
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.50:4000"
npm run dev
```

Cloudflare tunnel is optional now and only needed for remote/off-network device testing.

## Server env

`server/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-later"
PORT=4000
```

## Auth + journal API

- `POST /auth/register`
- `POST /auth/login`
- `GET /me` (Bearer token)
- `GET /journal` (user-scoped)
- `POST /journal` (user-scoped)
- `PUT /journal/:id` (owner only)
- `DELETE /journal/:id` (owner only)
