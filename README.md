# Sober Start

Expo app + Express/Prisma API for sobriety tracking (auth + user-owned journal entries).



## Expo env

Create a root `.env` for Expo when working on Supabase auth:
```env
EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
EXPO_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Supabase client setup for the Expo app lives in `lib/supabase.ts`.

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
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<session-pooler-host>:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
PORT=4000
```

## Supabase database setup

1. Create a Supabase project.
2. Go to `Project Settings -> Database`.
3. Copy the `Session Pooler` connection string for `DATABASE_URL`.
4. Copy the direct connection string for `DIRECT_URL`.
5. Put both into `server/.env`.
6. Create the first PostgreSQL migration with `npm --prefix server run prisma:migrate`.
7. Start the API.




## Auth + journal API

- `GET /me` (Bearer token)
- `GET /journal` (user-scoped)
- `POST /journal` (user-scoped)
- `PUT /journal/:id` (owner only)
- `DELETE /journal/:id` (owner only)

Legacy auth routes:
- `POST /auth/register` returns `410` because sign-up now happens in Supabase Auth
- `POST /auth/login` returns `410` because sign-in now happens in Supabase Auth
