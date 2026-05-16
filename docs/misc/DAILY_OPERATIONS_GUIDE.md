# Daily Operations Quick Reference

**Created:** May 13, 2026  
**For:** Operations Team & Admins  
**Purpose:** Quick checklist for daily system health verification  

---

## Morning Checklist (5 minutes)

### 1. Check Production Status
```bash
# Is the system online?
curl https://agency-ops-suite.vercel.app/api/health

# Expected: HTTP 200 ✅
# Takes: <1 second
```

### 2. Check Recent Errors
```
1. Vercel Dashboard
   - URL: https://vercel.com/dashboard
   - Click: agency-ops-suite project
   - View: Deployments & Logs tabs
   - Look for: Any red errors in last 24 hours
```

### 3. Quick Performance Check
```bash
# Run automated health check
node scripts/post-deployment-verification.js --watch 0

# Expected: All 4 endpoints ✅
# Error Rate: 0.00%
# Response Time: <2s average
```

### 4. Check Monitoring Log
```bash
# Any issues overnight?
tail -50 test-results/48hour-monitoring.log

# Look for: No errors, all 200s/401s/404s expected
```

---

## Issue Response (When Something's Wrong)

### Step 1: Identify Problem (2 minutes)
```
a) Is the website down completely?
   → Go to https://agency-ops-suite.vercel.app
   
b) Is a specific feature broken?
   → Note the feature & error message
   
c) Is performance slow?
   → Check: curl -w "@curl-format.txt" https://agency-ops-suite.vercel.app/api/health
```

### Step 2: Check Recent Changes (3 minutes)
```
1. Vercel Dashboard → Deployments
2. Did we deploy something today?
   - If YES: Was it working before? If no: Rollback (see below)
   - If NO: Check infrastructure status below
```

### Step 3: Check Infrastructure (3 minutes)
```
1. Supabase status (database)
   - URL: https://status.supabase.com/
   - Any outages? If yes: Wait & monitor

2. Vercel status (hosting)
   - URL: https://www.vercel-status.com/
   - Any outages? If yes: Wait & monitor

3. Our monitoring
   - Check test-results/48hour-monitoring.log
   - Errors? database? API timeouts?
```

### Step 4: Fix or Rollback
**If it's our code:**
```bash
# Option A: Quick Fix
1. Identify the bug
2. Fix in code
3. Push to main branch
4. Vercel auto-deploys
5. Monitor for 5 minutes

# Option B: Rollback
vercel rollback --prod --yes
# Then monitor for issues
```

**If it's infrastructure:**
```bash
# Wait for external service to recover
# Monitor: test-results/48hour-monitoring.log
# Check every 1 minute for 5 minutes
# If not recovered: Check provider's status page
```

---

## Critical Thresholds (Escalate If Exceeded)

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Error Rate | <0.1% | 0.1%-1% | >1% |
| Availability | >99.5% | 95%-99.5% | <95% |
| Avg Response | <500ms | 500-2s | >2s |
| Uptime | Continuous | <1 outage/day | Multiple outages |

**When to Escalate:**
- Error rate >1% → Check database/code
- Availability <95% → Evaluate rollback
- Response time >2s → Check database load

---

## Emergency Procedures

### Website Down? (Complete Outage)

1. Check if Vercel/Supabase are down
   - https://www.vercel-status.com/
   - https://status.supabase.com/

2. If our infrastructure is up, rollback last deployment
   ```bash
   vercel rollback --prod --yes
   ```

3. Monitor for 5 minutes to confirm recovery

4. If still down: Check Supabase
   ```
   Supabase Dashboard → Health
   Database running?
   ```

### Database Connection Lost

1. Check Supabase status
   ```
   https://app.supabase.com → Project Health
   ```

2. If Supabase is down:
   - Wait for recovery
   - Monitor every 2 minutes
   - Don't panic (it's rare)

3. If Supabase is up but we can't connect:
   ```
   Check Vercel env vars:
   - NEXT_PUBLIC_SUPABASE_URL: Set? Valid?
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Set? Valid?
   - SUPABASE_SERVICE_ROLE_KEY: Set? (for server-side)
   ```

### Performance Slow?

1. Check error rate first
   ```bash
   node scripts/post-deployment-verification.js --watch 0
   ```

2. If error rate OK but response time slow:
   - Check database queries
   - Look for N+1 query problems
   - Check Vercel Insights tab

3. If affects only certain endpoints:
   - Issue is likely in that endpoint code
   - Review recent changes
   - Deploy fix or rollback

### Specific Endpoint Returning 500?

1. Check endpoint name (e.g., /api/contracts)

2. Check Vercel logs
   ```
   https://vercel.com/dashboard
   Click: agency-ops-suite
   View: Logs tab
   Search: endpoint name
   ```

3. Look for error message

4. Fix in code or rollback if broken deployment

---

## Monitoring Status Command

**Check overall status anytime:**

```bash
# Current health
node scripts/post-deployment-verification.js --watch 0

# Extended monitoring (20 minutes)
node scripts/post-deployment-verification.js --watch 20

# All-day monitoring (1440 minutes)
node scripts/post-deployment-verification.js --watch 1440 &
tail -f test-results/48hour-monitoring.log
```

---

## Key Contacts & Resources

### Supabase Issues
- Dashboard: https://app.supabase.com
- Status: https://status.supabase.com/
- Docs: https://supabase.com/docs

### Vercel Issues
- Dashboard: https://vercel.com/dashboard
- Status: https://www.vercel-status.com/
- Docs: https://vercel.com/docs

### Our System
- Production: https://agency-ops-suite.vercel.app
- Health Check: https://agency-ops-suite.vercel.app/api/health
- Repository: https://github.com/[your-repo]

---

## Weekly Checklist (Every Monday)

- [ ] Review error rate from last week
- [ ] Check backup completions (if enabled)
- [ ] Review performance metrics
- [ ] Check for failed deployments
- [ ] Review any security alerts
- [ ] Test disaster recovery (quarterly)

---

## Monthly Tasks

- [ ] Review and optimize slow queries
- [ ] Audit database size & growth
- [ ] Review access logs for anomalies
- [ ] Update documentation if needed
- [ ] Plan for next optimization sprint
- [ ] Review security audit findings

---

## Useful Commands Reference

```bash
# Health check (all endpoints)
node scripts/post-deployment-verification.js --watch 0

# Test specific endpoint
curl https://agency-ops-suite.vercel.app/api/health -i

# Check auth (should return 401)
curl https://agency-ops-suite.vercel.app/api/contracts

# See last 100 lines of monitoring log
tail -100 test-results/48hour-monitoring.log

# Search monitoring log for errors
grep -i "error\|failed" test-results/48hour-monitoring.log

# Rollback to previous deployment
vercel rollback --prod --yes

# Check current Vercel status
vercel status

# View recent deployments
vercel ls
```

---

## Remember

✅ **System is Monitored**
- Automated checks running continuously
- Logs saved for analysis
- Alerts configured (if set up)

✅ **We Have Rollback**
- Previous version always available
- Rollback takes <1 minute
- Never trapped in bad deployment

✅ **Data is Protected**
- Backups enabled
- RLS policies active
- Secrets stored securely

---

**For detailed procedures, see:**
- [POST_DEPLOYMENT_OPERATIONAL_GUIDE.md](POST_DEPLOYMENT_OPERATIONAL_GUIDE.md)
- [MASTER_ACTION_CHECKLIST.md](docs/MASTER_ACTION_CHECKLIST.md)
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

**Questions? Check:**
- [README.md](README.md)
- [docs/](docs/)
- [scripts/README.md](scripts/README.md)

---

**Last Updated:** May 13, 2026  
**System Status:** 🟢 HEALTHY  
**Uptime:** 100% (since deployment)
