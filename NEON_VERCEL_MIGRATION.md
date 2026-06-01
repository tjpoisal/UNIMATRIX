# Migration from AWS + Supabase to Neon + Vercel

## Overview

This document outlines the shift from AWS CDK + Lambda + Supabase to a more modern stack:
- **Database**: Neon (Serverless PostgreSQL)
- **Web**: Vercel (Next.js deployment)
- **Mobile**: Expo (unchanged)
- **Auth**: NextAuth.js (JWT-based)

## Architecture Changes

### Before (AWS)
```
┌─────────────┬──────────────┬─────────────┐
│ Mobile App  │  Web (S3)    │ Desktop App │
└──────┬──────┴────────┬─────┴──────┬──────┘
       │               │            │
       └───────────────┼────────────┘
                       │
              ┌────────▼──────────┐
              │  AppSync GraphQL  │
              │  + Lambda         │
              └────────┬──────────┘
                       │
              ┌────────▼──────────┐
              │  RDS PostgreSQL   │
              │  + Supabase       │
              └───────────────────┘
```

### After (Neon + Vercel)
```
┌─────────────┬──────────────┬─────────────┐
│ Mobile App  │  Web (Vercel)│ Desktop App │
│ (Expo)      │  (Next.js)   │ (Electron)  │
└──────┬──────┴────────┬─────┴──────┬──────┘
       │               │            │
       └───────────────┼────────────┘
                       │
              ┌────────▼──────────┐
              │  Next.js API      │
              │  Routes           │
              └────────┬──────────┘
                       │
              ┌────────▼──────────┐
              │  Neon PostgreSQL  │
              │  (Serverless)     │
              └───────────────────┘
```

## Benefits

| Aspect | AWS | Neon + Vercel |
|--------|-----|---------------|
| **Database** | RDS (always-on VMs) | Serverless (pay per transaction) |
| **Web Hosting** | S3 + CloudFront | Vercel (optimized for Next.js) |
| **API** | Lambda + AppSync | Next.js API Routes (simpler) |
| **Cost** | ~$200-500/mo | ~$50-150/mo (MVP) |
| **Deployment** | CDK (complex) | Vercel Dashboard (simple) |
| **Secrets** | AWS Secrets Mgr | Vercel Environment Variables |
| **Scaling** | Auto-scaling groups | Auto-scaling (built-in) |

## Migration Checklist

### Phase 1: Setup Neon + Vercel (DONE)
- [x] Create Neon PostgreSQL instance
- [x] Create Prisma schema (matches old RDS schema)
- [x] Set up NextAuth.js for JWT auth
- [x] Create Next.js API routes (replaces Lambda handlers)
- [x] Create environment configuration (.env.local)
- [x] Deploy web app to Vercel

### Phase 2: Migrate Data
- [ ] Dump data from RDS PostgreSQL
- [ ] Load data into Neon
- [ ] Verify row counts and relationships
- [ ] Test queries in both databases
- [ ] Validate referential integrity

### Phase 3: Update Mobile App
- [ ] Update Expo app to use NextAuth endpoints
- [ ] Change API calls from Lambda to Vercel
- [ ] Test offline-first sync with new API
- [ ] Update environment variables (NEXT_PUBLIC_API_URL)

### Phase 4: Decommission AWS
- [ ] Delete Lambda functions
- [ ] Delete AppSync APIs
- [ ] Delete RDS instance
- [ ] Cancel AWS billing

## Key Differences from Lambda Handlers

### Authentication
**Lambda**: OAuth tokens stored in Supabase
**Vercel**: JWT tokens managed by NextAuth.js

Migration:
```typescript
// OLD (Lambda): Used Supabase Auth
import { supabaseAdmin } from '@supabase/supabase-js';
const user = await supabaseAdmin.auth.getUser(token);

// NEW (Next.js): Use NextAuth
import { getServerSession } from 'next-auth/next';
const session = await getServerSession(authOptions);
const user = session.user; // Already authenticated
```

### Database Access
**Lambda**: Direct access to RDS via connection pooling
**Vercel**: All access through Prisma client

Migration:
```typescript
// OLD: Raw SQL in Lambda
const result = await rdsClient.query('SELECT * FROM palaces...');

// NEW: Type-safe Prisma
const palaces = await prisma.palace.findMany({...});
```

### API Responses
**Lambda**: GraphQL via AppSync mutations
**Vercel**: REST JSON via Next.js routes

Migration:
```typescript
// OLD: GraphQL mutation
mutation CompleteLLMMessage {
  completeLLMMessage(messages: [...]) {
    content
    cost
  }
}

// NEW: POST endpoint
POST /api/llm/complete
{ messages: [...] }
```

## Data Migration Steps

### Step 1: Export RDS Data
```sql
-- From your RDS instance
pg_dump -h your-rds-endpoint -U admin unimatrix > backup.sql
```

### Step 2: Import to Neon
```bash
# Get Neon connection string
psql "postgresql://user:password@ep-xxxxx.neon.tech/unimatrix" < backup.sql
```

### Step 3: Verify Migration
```sql
-- Check table counts
SELECT schemaname, tablename, 
  (SELECT count(*) FROM schemaname.tablename) as row_count
FROM pg_tables;
```

## Update Mobile App

### Expo Changes

1. **Update API endpoint** in mobile app:
```typescript
// OLD
const API_URL = 'https://api.appsync.amazonaws.com/graphql';

// NEW
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unimatrix-flax.vercel.app/api';
```

2. **Sync payload format**:
```typescript
// OLD: GraphQL mutations
mutation {
  syncPalaces(deviceId: "...", changes: [...])
}

// NEW: REST POST
POST /api/sync
{
  deviceId: "...",
  deviceName: "iPhone 14",
  changes: [...]
}
```

3. **Auth flow**:
```typescript
// OLD: Supabase Auth
import { supabase } from '@supabase/supabase-js';
await supabase.auth.signUp({ email, password });

// NEW: NextAuth REST endpoint
POST /api/auth/register
{ email, password, name }
```

## LLM System Integration

The `@unimatrix/llm` package **remains unchanged**. To integrate with Vercel:

```typescript
// In /api/llm/complete/route.ts
import { initializeLLMSystem } from '@unimatrix/llm';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { messages } = await request.json();

  const llmSystem = initializeLLMSystem();
  const provider = await llmSystem.router.route(messages, 'best');
  const result = await provider!.complete(messages);

  return NextResponse.json(result);
}
```

## Cost Comparison

### AWS (Current)
- RDS t3.micro: ~$20/mo
- Lambda: ~$0.20/mo
- AppSync: ~$5/mo
- Data transfer: ~$10/mo
- **Total: ~$35/mo**

### Neon + Vercel (New)
- Neon free tier (3 projects, 5GB): Free (or $20/mo Pro)
- Vercel Hobby (5 deployments/day): Free
- Vercel Pro (unlimited): $20/mo
- Data transfer: Included
- **Total: Free-20/mo**

## Rollback Plan

If issues occur:

1. Keep RDS running during transition period
2. Parallel run both systems for 1 week
3. Monitor error rates on both
4. Only decommission AWS after 100% confidence

## Testing Checklist

- [ ] Auth works (register, login, logout)
- [ ] Offline sync completes successfully
- [ ] Search returns correct results
- [ ] Exports generate valid JSON/Markdown
- [ ] LLM routes to correct providers
- [ ] Mobile app connects to Vercel API
- [ ] Database queries perform < 500ms
- [ ] Error handling returns proper status codes

## Support & Troubleshooting

### Common Issues

**Issue**: "database URL is invalid"
```
Check: DATABASE_URL format is postgresql://user:pass@ep-xxx.neon.tech/db
```

**Issue**: "too many connections"
```
Solution: Increase Neon connection pool or implement connection pooling
```

**Issue**: "CORS errors from mobile"
```
Add: CORS headers in Next.js middleware or API routes
```

## Next Steps

1. ✅ Set up Neon database and Vercel deployment
2. ⏳ Migrate existing data from RDS
3. ⏳ Update mobile app to use new API
4. ⏳ Run parallel testing (both systems)
5. ⏳ Decommission AWS infrastructure
6. ⏳ Monitor Vercel/Neon performance and costs

## References

- [Neon Docs](https://neon.tech/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
