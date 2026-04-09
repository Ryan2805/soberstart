# Sober Start

Expo app + Express/Prisma API for sobriety tracking (auth + user-owned journal entries).

This project is being migrated from local SQLite to hosted PostgreSQL so it can use Supabase for the database first, then Supabase Auth next.

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
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
JWT_SECRET="dev-secret-change-later"
PORT=4000
```

## Supabase database setup

1. Create a Supabase project.
2. Go to `Project Settings -> Database`.
3. Copy the Prisma or transaction pooler connection string.
4. Put it in `server/.env` as `DATABASE_URL`.
5. Create the first PostgreSQL migration with `npm --prefix server run prisma:migrate`.
6. Start the API.

Current branch status:
- Prisma datasource now targets PostgreSQL instead of SQLite.
- The Express server now uses the default Prisma client connection instead of the SQLite adapter.
- Old SQLite Prisma migration files were removed so the first migration created on this branch will be the new PostgreSQL baseline.

## Auth + journal API

- `POST /auth/register`
- `POST /auth/login`
- `GET /me` (Bearer token)
- `GET /journal` (user-scoped)
- `POST /journal` (user-scoped)
- `PUT /journal/:id` (owner only)
- `DELETE /journal/:id` (owner only)
