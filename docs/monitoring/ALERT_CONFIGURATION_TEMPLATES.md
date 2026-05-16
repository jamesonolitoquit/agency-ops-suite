# Alert Configuration Templates

This document provides ready-to-use alert configurations for multiple monitoring platforms.

**Choose one or more monitoring service:**
- Vercel Alerts
- Sentry (Error tracking)
- DataDog
- New Relic
- LogRocket

---

## 1. Vercel Alerts Configuration

### How to Set Up:
1. Go to Vercel Dashboard → Project Settings → Integrations
2. Add notification integration (Email, Slack, etc.)
3. Configure alerts below

### Alert 1: High 500 Error Rate

**Name:** Server Error Spike  
**Condition:** 5xx errors > 5 in 5 minutes  
**Severity:** Critical  
**Notification:** Immediate  

```javascript
// Webhook payload example for custom integration
{
  "alert": {
    "name": "Server Error Spike",
    "threshold": 5,
    "window": "5m",
    "metric": "5xx_errors",
    "action": "notify"
  }
}
```

### Alert 2: Authentication Failures

**Name:** Auth Failure Spike  
**Condition:** 401/403 errors > 20 in 5 minutes  
**Severity:** High  
**Notification:** Within 5 minutes  

```javascript
{
  "alert": {
    "name": "Auth Failure Spike",
    "threshold": 20,
    "window": "5m",
    "metric": "auth_failures",
    "codes": [401, 403],
    "action": "notify"
  }
}
```

### Alert 3: Database Connection Failures

**Name:** Database Connectivity Issue  
**Condition:** Connection errors > 3 in 10 minutes  
**Severity:** Critical  
**Notification:** Immediate  

```javascript
{
  "alert": {
    "name": "Database Connection Failures",
    "threshold": 3,
    "window": "10m",
    "metric": "db_connection_errors",
    "action": "notify_ops"
  }
}
```

### Alert 4: Lead Intake Webhook Failures

**Name:** Webhook Processing Error  
**Condition:** Webhook errors > 5 in 1 hour  
**Severity:** High  
**Notification:** Within 15 minutes  

```javascript
{
  "alert": {
    "name": "Webhook Processing Errors",
    "threshold": 5,
    "window": "60m",
    "endpoint": "/api/intake/lead",
    "metric": "webhook_errors",
    "action": "notify"
  }
}
```

### Alert 5: High Response Time

**Name:** Performance Degradation  
**Condition:** p95 response time > 500ms  
**Severity:** Medium  
**Notification:** Within 10 minutes  

```javascript
{
  "alert": {
    "name": "High Response Time",
    "threshold": 500,
    "percentile": 95,
    "metric": "response_time_ms",
    "window": "5m",
    "action": "notify"
  }
}
```

---

## 2. Sentry Configuration

Sentry is excellent for error tracking and crash reporting.

### Setup Instructions:
1. Create Sentry account: https://sentry.io
2. Create new project for "Agency Ops Suite"
3. Install Sentry SDK in Next.js app
4. Configure alerts below

### Installation:
```bash
npm install @sentry/nextjs
```

### next.config.mjs Configuration:
```javascript
// At the top of next.config.mjs
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  reactStrictMode: true,
  // ... other config
};

export default withSentryConfig(
  nextConfig,
  {
    org: "your-org",
    project: "agency-ops-suite",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### Sentry Alert Rules

**Alert Rule 1: High Error Rate**
```
Trigger: When an event is first seen
Conditions:
  - error.level equals "error"
  - event.tags.error_type is not None
Filter:
  - environment equals "production"
Actions:
  - Send notification to #alerts Slack channel
```

**Alert Rule 2: Performance Regression**
```
Trigger: Metric alert
Metric: Duration
Threshold: p95(duration) > 500ms
Filter:
  - transaction.op equals "http.server"
  - environment equals "production"
Actions:
  - Send PagerDuty notification
```

**Alert Rule 3: Custom Exception Tracking**
```
Trigger: When an event is first seen
Conditions:
  - exception.type equals "DatabaseConnectionError"
  - OR exception.type equals "AuthenticationError"
Filter:
  - environment equals "production"
Actions:
  - Notify ops team immediately
```

---

## 3. DataDog Configuration

DataDog is ideal for comprehensive monitoring across all services.

### Setup Instructions:
1. Create DataDog account: https://www.datadoghq.com
2. Add Vercel integration
3. Set up monitors below

### Vercel Integration Setup:
1. Go to DataDog → Integrations → Vercel
2. Connect your Vercel account
3. Select "agency-ops-suite" project

### Monitor 1: Application Error Rate
```yaml
name: "Application Error Rate High"
type: "metric alert"
query: "avg:trace.web.request.errors{service:agency-ops-suite,env:prod}.as_count() > 5"
alert_condition: "avg(last_5m) > 5"
notify: |
  @team-ops
  @pagerduty
```

### Monitor 2: Database Connection Pool
```yaml
name: "Database Connection Pool Saturation"
type: "metric alert"
query: "avg:postgresql.connections{service:agency-ops-suite} > 80"
alert_condition: "avg(last_5m) > 80"
notify:
  - "@team-ops"
  - "@slack-alerts"
```

### Monitor 3: API Response Time
```yaml
name: "API Response Time Degradation"
type: "metric alert"
query: "p95:trace.web.request.duration{service:agency-ops-suite,env:prod} > 500"
alert_condition: "avg(last_5m) > 500"
severity: "warning"
notify:
  - "@team-ops"
```

### Monitor 4: Webhook Processing Failures
```yaml
name: "Lead Intake Webhook Failures"
type: "event alert"
query: "service:agency-ops-suite endpoint:/api/intake/lead status:error"
alert_condition: "count() > 5 over last_1h"
notify:
  - "@team-ops"
```

---

## 4. New Relic Configuration

New Relic provides APM and infrastructure monitoring.

### Setup Instructions:
1. Create New Relic account: https://newrelic.com
2. Install Node.js agent
3. Configure alerts

### Installation:
```bash
npm install newrelic
```

### New Relic Alert Policies

**Policy 1: Application Performance**
```json
{
  "name": "Agency Ops Suite - Performance",
  "incident_preference": "PER_POLICY",
  "conditions": [
    {
      "type": "apm_app_metric",
      "metric": "response_time_ms",
      "duration": "5",
      "threshold": "500",
      "comparison": "above"
    }
  ],
  "notification_channels": ["email", "slack"]
}
```

**Policy 2: Error Rate**
```json
{
  "name": "Agency Ops Suite - Error Rate",
  "conditions": [
    {
      "type": "apm_app_metric",
      "metric": "error_percentage",
      "duration": "5",
      "threshold": "5",
      "comparison": "above"
    }
  ],
  "notification_channels": ["pagerduty"]
}
```

---

## 5. LogRocket Configuration

LogRocket focuses on frontend errors and user session replay.

### Setup Instructions:
1. Create LogRocket account: https://logrocket.com
2. Create new project
3. Install SDK

### Installation:
```bash
npm install logrocket
```

### Initialize in _app.tsx:
```typescript
import LogRocket from 'logrocket';

if (process.env.NEXT_PUBLIC_ENV === 'production') {
  LogRocket.init('your-app-id');
  
  // Log user identity
  LogRocket.identify(user?.id, {
    email: user?.email,
    role: user?.role,
  });
}
```

### LogRocket Alert Rules

**Rule 1: JavaScript Errors**
```
Trigger: When error count exceeds 10 in 5 minutes
Notification: Email + Slack
```

**Rule 2: Network Errors**
```
Trigger: When network failures exceed 20% in 5 minutes
Notification: Slack #alerts
```

---

## 6. Custom Webhook Alerting

For minimal setup, use custom webhooks:

### Generic Webhook Template

```json
{
  "alert": {
    "name": "Agency Ops Suite Alert",
    "severity": "critical",
    "message": "Critical alert triggered",
    "details": {
      "error_type": "database_connection_failed",
      "timestamp": "2026-05-13T10:30:00Z",
      "affected_endpoint": "/api/contracts",
      "error_count": 5,
      "window": "5 minutes"
    },
    "actions": [
      "immediate_notification",
      "auto_investigate",
      "escalate_if_unresolved_in_15m"
    ]
  }
}
```

### Slack Webhook Integration

```bash
# Set up Slack webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🚨 Alert: Database connection failed. Error count: 5"}' \
  YOUR_SLACK_WEBHOOK_URL
```

---

## Recommended Alert Configuration (Quick Start)

If you only set up 5 alerts, choose these:

### 1. **Critical: 5xx Errors** (Highest Priority)
- Threshold: > 5 errors in 5 minutes
- Notification: Immediate (SMS + Email)
- Action: Auto-page on-call engineer

### 2. **High: Database Failures** (Critical Dependency)
- Threshold: > 3 connection failures in 10 minutes
- Notification: Within 5 minutes (Slack + Email)
- Action: Escalate if not resolved in 15 minutes

### 3. **High: Authentication Failures** (Security)
- Threshold: > 20 auth errors in 5 minutes
- Notification: Within 5 minutes (Email)
- Action: Investigate unusual patterns

### 4. **Medium: Response Time** (Performance)
- Threshold: p95 > 500ms for 10 minutes
- Notification: Within 10 minutes (Slack)
- Action: Review database queries and caching

### 5. **Medium: Webhook Failures** (Data Integration)
- Threshold: > 5 failures in 1 hour
- Notification: Within 15 minutes (Email)
- Action: Check webhook endpoint logs

---

## Testing Alerts

### How to Trigger Alerts (for Testing)

**Test 1: Generate 5xx Error**
```bash
# This will trigger database error
curl https://agency-ops-suite.vercel.app/api/contracts-invalid
```

**Test 2: Test Auth Failure Alert**
```bash
# Send multiple auth failure requests
for i in {1..30}; do
  curl -H "Authorization: Bearer invalid" \
    https://agency-ops-suite.vercel.app/api/contracts &
done
```

**Test 3: Test Webhook Alert**
```bash
# Send invalid webhook requests
for i in {1..10}; do
  curl -X POST https://agency-ops-suite.vercel.app/api/intake/lead \
    -H "x-webhook-secret: wrong-secret" \
    -d '{}' &
done
```

---

## Alert Testing Checklist

- [ ] Alert 1 configured and tested (5xx errors)
- [ ] Alert 2 configured and tested (database)
- [ ] Alert 3 configured and tested (auth failures)
- [ ] Alert 4 configured and tested (webhooks)
- [ ] Alert 5 configured and tested (response time)
- [ ] Notification channels working (Slack, Email, SMS)
- [ ] Escalation procedures defined
- [ ] Team members trained on alert response
- [ ] Runbooks created for each alert
- [ ] Alert thresholds documented

---

## Runbook Template

When an alert fires, use this template:

```markdown
# Alert Runbook: [Alert Name]

## Alert Details
- **Alert:** [Name]
- **Severity:** [Critical/High/Medium/Low]
- **Service:** Agency Ops Suite
- **Triggered:** [Timestamp]

## Investigation Steps

1. **Immediate (0-5 min)**
   - Check system dashboard
   - Look at recent deployments
   - Check database status

2. **Short-term (5-15 min)**
   - Review error logs
   - Check metrics dashboard
   - Interview affected users

3. **Resolution (15+ min)**
   - Implement fix or rollback
   - Verify fix is working
   - Communicate status to stakeholders

## Escalation
- If unresolved in 15 min: Notify [Escalation Contact]
- If unresolved in 30 min: Notify [Manager]
- If unresolved in 1 hour: Page on-call director

## Prevention
- Add this to regression testing
- Review monitoring coverage
- Update documentation
```

---

## Monitoring Service Comparison

| Service | Best For | Cost | Setup Time |
|---------|----------|------|-----------|
| **Vercel** | Frontend + Deployment | Included | 10 min |
| **Sentry** | Error tracking | Free tier available | 15 min |
| **DataDog** | Comprehensive monitoring | Paid | 30 min |
| **New Relic** | APM + Infrastructure | Paid | 30 min |
| **LogRocket** | Frontend replay | Paid | 20 min |
| **Custom Webhook** | Minimal setup | Free | 5 min |

**Recommendation:** Start with Vercel built-in alerts (free) or Sentry (generous free tier), then add DataDog or New Relic as you scale.

