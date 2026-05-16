# Monitoring Dashboard Setup

This guide explains what still needs to be configured manually for full production observability.

## Goal

Create dashboards and alerts for:
- System health
- Error rate
- Auth failures
- Performance
- User activity
- Backup failures

## What You Can Verify in Code Today

- Structured logging exists in the app.
- Request IDs are used for correlation.
- Audit logs and system events are already written by the app.
- Production and staging smoke tests are passing.

## What Still Needs Manual Setup

### 1. System Health Dashboard

Create a dashboard that shows:
- 2xx/4xx/5xx response counts
- `/api/health` uptime checks
- Build/deploy status
- Recent request failures

Use:
- Vercel function logs
- Supabase logs
- Your uptime monitor, if you have one

### 2. Error Rate Dashboard

Create a dashboard showing:
- 5xx count over time
- Repeated endpoint failures
- Recent exceptions by route
- Top failing request IDs

Suggested threshold:
- Alert if error rate exceeds 5% of requests.

### 3. Auth Failure Dashboard

Create a dashboard showing:
- 401/403 counts over time
- Failed login attempts
- Unauthorized admin route attempts
- Auth failures by endpoint

Suggested threshold:
- Alert if failures spike above 10 per minute.

### 4. Performance Dashboard

Track:
- Average response time
- p95 response time
- p99 response time
- Slow endpoints
- Deployment-to-deployment variance

Suggested thresholds:
- Average response time under 300ms
- p99 under 1000ms

### 5. User Activity Dashboard

Track:
- Lead intake submissions
- Audit log writes
- Admin actions
- Session sign-ins/sign-outs

## Alert Rules to Configure

- High error rate alert
- Database connection alert
- Auth failure spike alert
- Deployment failure alert
- Backup failure alert

## Recommended Setup Order

1. Start with system health and error rate.
2. Add auth failures next.
3. Add performance thresholds.
4. Add user activity.
5. Add backup alerts last.

## Manual Steps

1. Open your observability platform.
2. Connect Vercel logs and Supabase logs.
3. Create the dashboards listed above.
4. Add the alert rules.
5. Test each alert with a safe simulated failure or sample log query.
6. Record the dashboard URLs in the operations runbook.

## Acceptance Criteria

- You can detect a 500 error within minutes.
- You can detect unauthorized access spikes.
- You can detect backup failures.
- You can see basic traffic and performance trends.

## Related Docs

- [MONITORING_COMPLETION.md](MONITORING_COMPLETION.md)
- [PRODUCTION_OPERATIONS_RUNBOOK.md](PRODUCTION_OPERATIONS_RUNBOOK.md)
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
