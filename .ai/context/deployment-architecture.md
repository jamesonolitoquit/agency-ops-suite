# deployment-architecture.md

Infrastructure and deployment setup.

## Environments

| Environment | URL | Purpose | Auto-Deploy |
|-------------|-----|---------|-------------|
| Development | localhost:3000 | Local development | N/A |
| Staging | staging.domain.com | Testing before prod | Manual |
| Production | domain.com | Live for users | Auto (main branch) |

## Deployment Flow

```
1. Push to feature branch
   ↓
2. GitHub Actions runs tests
   ↓
3. Tests pass → Create PR
   ↓
4. Code review → Approve
   ↓
5. Merge to main
   ↓
6. GitHub Actions deploys to production (Vercel)
   ↓
7. Health checks pass
   ↓
8. Live on production
```

## Environment Variables

**Production:**
- NEXT_PUBLIC_API_URL: [domain.com/api]
- SUPABASE_URL: [supabase URL]
- SUPABASE_ANON_KEY: [public key]
- DATABASE_URL: [connection string]

**Staging:**
- Points to staging database
- Points to staging Supabase project

## Rollback Procedure

If production breaks:
1. Identify issue
2. Revert to previous commit
3. Push to main
4. Vercel auto-deploys
5. Verify health checks
6. Post-mortem scheduling

**Time to rollback:** < 5 minutes

## Monitoring

- Error tracking: Sentry alerts on critical
- Performance: Vercel analytics
- Database: Supabase monitoring
- Uptime: Status page

## Database Migrations

- Migrations: `.sql` files in migrations/ folder
- Execution: `npm run migrate`
- Rollback: Manual restore (keep backups)

## Backups

- Daily automated backups (Supabase)
- Retention: 30 days
- Recovery: Supabase restore interface
