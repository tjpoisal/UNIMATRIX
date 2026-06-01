# Unimatrix Web App Setup Guide

## Prerequisites

- Node.js 20.9.0 or higher
- npm 10.8.2 or higher
- A Neon PostgreSQL database
- A Vercel account for deployment

## Step 1: Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project (select PostgreSQL)
3. Create a database named `unimatrix`
4. Copy the connection string (looks like: `postgresql://user:password@ep-xxxxx.us-east-2.neon.tech/unimatrix`)

## Step 2: Configure Environment Variables

1. Copy `.env.local` and update with your Neon connection string:
```bash
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.neon.tech/unimatrix"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
```

2. Generate a NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

3. Update `.env.local` with the generated secret.

## Step 3: Push Schema to Neon

```bash
npm install
npm run db:push
```

This creates all tables in your Neon database without creating migration files (useful for development).

## Step 4: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Step 5: Test the API

### Create a new user (registration)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Create a palace
```bash
# First, sign in via NextAuth to get a session
# Then POST to /api/palaces with your session
curl -X POST http://localhost:3000/api/palaces \
  -H "Content-Type: application/json" \
  -d '{"name":"My Palace","description":"My first memory palace"}'
```

## Deployment to Vercel

### Step 1: Prepare Repository

```bash
# From root of unimatrix
git add .
git commit -m "feat: add Neon + Vercel web app"
git push
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Select `apps/web` as the root directory
4. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `NEXTAUTH_URL` (your Vercel domain, e.g., `https://unimatrix-flax.vercel.app`)
   - `NEXTAUTH_SECRET` (same as local)

### Step 3: Deploy

Vercel will automatically:
1. Run `npm install`
2. Run `npm run build` (which includes `prisma generate`)
3. Deploy to a URL

### Step 4: Run Prisma Migrations in Production

After deployment, connect to your database and run migrations:

```bash
# From your local machine
DATABASE_URL="postgresql://..." npm run db:push
```

Or use Vercel's CLI:
```bash
vercel env pull  # Pull environment variables
npm run db:push
```

## Project Structure

```
apps/web/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   └── register/route.ts         # Signup endpoint
│   │   ├── palaces/route.ts              # Palace CRUD
│   │   ├── locations/route.ts            # Location CRUD
│   │   ├── memories/route.ts             # Memory CRUD
│   │   ├── sync/route.ts                 # Mobile sync endpoint
│   │   ├── search/route.ts               # Full-text search
│   │   └── export/route.ts               # Export JSON/Markdown
│   └── (app screens go here)
├── lib/
│   ├── auth.ts                           # NextAuth configuration
│   └── prisma.ts                         # Prisma client
├── prisma/
│   └── schema.prisma                     # Database schema
├── public/                               # Static assets
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create new user
- `POST /api/auth/signin` — Login (NextAuth)
- `POST /api/auth/callback/credentials` — Credentials verification
- `POST /api/auth/signout` — Logout

### Palaces
- `GET /api/palaces` — List all palaces
- `POST /api/palaces` — Create palace
- `GET /api/palaces/[id]` — Get palace with locations
- `PUT /api/palaces/[id]` — Update palace
- `DELETE /api/palaces/[id]` — Delete palace (soft delete)

### Locations
- `POST /api/locations` — Create location (nested)
- `PUT /api/locations` — Update location
- `DELETE /api/locations` — Delete location

### Memories
- `POST /api/memories` — Create memory
- `PUT /api/memories` — Update memory
- `DELETE /api/memories` — Delete memory

### Sync & Search
- `POST /api/sync` — Mobile offline sync
- `GET /api/search?q=query&palaceId=id` — Full-text search
- `POST /api/export` — Export palace (JSON or Markdown)

## Troubleshooting

### "relation \"User\" does not exist"
Your Prisma schema hasn't been pushed to the database. Run:
```bash
npm run db:push
```

### "NEXTAUTH_SECRET is not set"
Generate and add to `.env.local`:
```bash
openssl rand -base64 32
```

### Connection refused to localhost:5432
You're not connecting to Neon. Make sure `DATABASE_URL` starts with `postgresql://`

### Prisma Client version mismatch
Regenerate the client:
```bash
npx prisma generate
```

## Next Steps

1. **Build Frontend** — Add React components in `app/` directory
2. **Add OAuth** — Configure Google/GitHub in `lib/auth.ts`
3. **Mobile Integration** — Update Expo app to use these API endpoints
4. **Export/Import** — Implement JSON import from file upload
5. **Real-time Sync** — Add WebSocket subscriptions for multi-device sync

## Performance Tips

- **Search**: Add full-text search index on memories.content
- **Pagination**: Add `skip` and `take` parameters to list endpoints
- **Caching**: Add `Cache-Control` headers for static responses
- **Database**: Monitor Neon CPU/RAM usage in console

## Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET` in production
- [ ] Enable HTTPS for all endpoints (`NEXTAUTH_URL` is https://)
- [ ] Use environment variables for all secrets (no hardcoding)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CORS headers if needed for mobile/cross-origin access
- [ ] Verify RLS policies (check Prisma schema soft deletes)
- [ ] Rotate secrets quarterly
