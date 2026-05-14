# Unimatrix Web App

A Next.js 15 + Neon + NextAuth.js web application for managing memory palaces.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/unimatrix
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
```

### 3. Push Schema
```bash
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v4 (JWT tokens)
- **UI**: React 19 + Tailwind CSS
- **Type Safety**: TypeScript 5.9
- **Deployment**: Vercel

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── palaces/      # Memory palace CRUD
│   ├── locations/    # Location hierarchy CRUD
│   ├── memories/     # Memory content CRUD
│   ├── sync/         # Mobile offline sync
│   ├── search/       # Full-text search
│   └── export/       # JSON/Markdown export
├── (ui)/             # UI screens (add here)
└── layout.tsx        # Root layout
lib/
├── auth.ts          # NextAuth configuration
└── prisma.ts        # Prisma client singleton
prisma/
├── schema.prisma    # Database schema (Neon PostgreSQL)
└── migrations/      # Migration files (optional)
public/              # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/register` — Create account
- `POST /api/auth/signin` — Login
- `POST /api/auth/signout` — Logout
- `GET /api/auth/session` — Get current session

### Palaces
- `GET /api/palaces` — List user's palaces
- `POST /api/palaces` — Create palace
- `GET /api/palaces/[id]` — Get palace with hierarchy
- `PUT /api/palaces/[id]` — Update palace
- `DELETE /api/palaces/[id]` — Delete palace

### Locations (nested folders)
- `POST /api/locations` — Create location
- `PUT /api/locations` — Update location
- `DELETE /api/locations` — Delete location

### Memories (stored content)
- `POST /api/memories` — Create memory
- `PUT /api/memories` — Update memory
- `DELETE /api/memories` — Delete memory

### Sync & Search
- `POST /api/sync` — Sync offline changes (mobile)
- `GET /api/search?q=query` — Full-text search
- `POST /api/export` — Export palace (JSON/Markdown)

## Database Schema

### Users
- `id` (UUID, primary key)
- `email` (unique)
- `password` (hashed)
- `name`
- `tier` (free|pro)

### Palaces
- `id` (UUID)
- `userId` (FK)
- `name`
- `description`
- `isPublic`

### Locations (hierarchical)
- `id` (UUID)
- `palaceId` (FK)
- `parentId` (FK, self-referential)
- `name`
- `position` (for ordering)

### Memories
- `id` (UUID)
- `locationId` (FK)
- `content` (markdown)
- `tags` (array)
- `lastAccessed`

### SyncState
- `deviceId`
- `userId` (FK)
- `lastSync`

## Development

```bash
# Run dev server
npm run dev

# Database studio
npm run db:studio

# Create migration
npm run db:migrate

# Push schema to DB
npm run db:push

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

## Deployment to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to `apps/web`
4. Add environment variables
5. Deploy

See `SETUP.md` for detailed instructions.

## Next Steps

- Build UI components
- Update Expo mobile app to use these APIs
- Add LLM routes
- Implement real-time sync
- Set up monitoring

See `SETUP.md` and `../../../NEON_VERCEL_MIGRATION.md` for detailed guides.
