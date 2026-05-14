# Vercel Monitoring Dashboard Setup Automation

**Purpose:** Complete guide to set up monitoring dashboards in Vercel  
**Time Required:** 30-60 minutes  
**Complexity:** Easy-Medium  

---

## Overview

This guide provides step-by-step instructions to set up comprehensive monitoring dashboards for your production deployment.

### Dashboard Strategy

Create 5 focused dashboards:
1. **System Health** - Overall system status
2. **Performance** - Response times and throughput
3. **Errors** - Error rates and types
4. **Security** - Auth failures and rate limits
5. **Business** - Lead intake and feature usage

---

## Prerequisites

- Vercel project access
- Admin permissions on Vercel project
- Team email for notifications

---

## Part 1: Enable Vercel Analytics

### Step 1: Access Project Settings

```
1. Go to https://vercel.com/dashboard
2. Select project: "agency-ops-suite"
3. Click "Settings" tab
4. Navigate to "Analytics"
```

### Step 2: Enable Web Vitals

```
1. In Analytics section, click "Enable Web Vitals"
2. Select "agency-ops-suite" project
3. Choose metrics:
   ✓ First Contentful Paint (FCP)
   ✓ Largest Contentful Paint (LCP)
   ✓ Cumulative Layout Shift (CLS)
   ✓ Time to First Byte (TTFB)
   ✓ Next.js hydration time
4. Click "Continue"
5. Data will appear within 24 hours
```

### Step 3: View Analytics Dashboard

```
1. In project dashboard, click "Analytics" tab
2. Select "Web Vitals" view
3. Choose time range (Last 7 days recommended)
4. Review metrics:
   - Performance score
   - Page load times
   - User experience metrics
```

---

## Part 2: Set Up Function Monitoring

### Step 1: Enable Function Monitoring

```
1. Go to Project Settings → Functions
2. Toggle "Enable Function Monitoring" ON
3. Configure monitoring:
   - Memory tracking: ON
   - Duration tracking: ON
   - Error tracking: ON
   - Custom logs: ON
```

### Step 2: View Function Logs

```
1. In project dashboard, click "Deployments"
2. Select latest deployment
3. Click "Logs" tab
4. View real-time function execution
5. Filter by:
   - Function name: /api/*
   - Status: error, success
   - Duration: slow queries
```

### Step 3: Set Up Log Streaming (Optional)

```
1. Go to Settings → Integrations
2. Click "Add Integration"
3. Choose logging service:
   - Datadog
   - LogRocket
   - Axiom
   - Custom webhook
4. Follow integration setup wizard
5. Configure log forwarding
```

---

## Part 3: Create Custom Dashboards

### Dashboard 1: System Health

**Purpose:** Overview of system status

**Steps:**
```
1. Go to Vercel Dashboard
2. Create custom dashboard:
   - Name: "System Health"
   - Scope: Production deployment
3. Add widgets:
   - [ ] Deployment status (green/red)
   - [ ] Build time (current)
   - [ ] Memory usage (current)
   - [ ] Uptime (30 days)
   - [ ] Active function count
   - [ ] Database connection status (if available)
4. Save and pin to sidebar
```

**Metrics to Monitor:**
- Deployment success rate (target: 100%)
- Average build time (target: < 5 min)
- Memory usage (target: < 512MB)
- Uptime percentage (target: > 99.9%)

---

### Dashboard 2: Performance Metrics

**Purpose:** Track API and page load performance

**Steps:**
```
1. Create new custom dashboard
   - Name: "Performance"
   - Scope: Production
2. Add widgets:
   - [ ] First Contentful Paint (FCP)
   - [ ] Largest Contentful Paint (LCP)
   - [ ] Average response time
   - [ ] p95 response time
   - [ ] p99 response time
   - [ ] Request throughput (requests/min)
   - [ ] Bandwidth usage
   - [ ] Cache hit rate
3. Set target lines:
   - FCP: 1000ms
   - LCP: 2500ms
   - Response: 300ms (p95)
```

**Alert Thresholds:**
- FCP > 1.5s: Warning
- LCP > 4s: Critical
- Response time p95 > 500ms: Warning
- Throughput < 10 req/min: Warning (unusual)

---

### Dashboard 3: Error Tracking

**Purpose:** Monitor error rates and types

**Steps:**
```
1. Create new custom dashboard
   - Name: "Error Tracking"
   - Scope: Production
2. Add widgets:
   - [ ] 5xx error rate (graph)
   - [ ] 4xx error rate (graph)
   - [ ] Error count (total)
   - [ ] Top error types (table)
   - [ ] Error timeline (24 hour)
   - [ ] Error by endpoint (breakdown)
   - [ ] Error trend (7 day)
3. Configure alerts:
   - Red line: 5xx > 5 in 5 min
   - Yellow line: 4xx > 20 in 5 min
```

**Alert Configuration:**
```json
{
  "alerts": [
    {
      "name": "High 5xx Error Rate",
      "threshold": 5,
      "window": "5m",
      "severity": "critical"
    },
    {
      "name": "High 4xx Error Rate",
      "threshold": 20,
      "window": "5m",
      "severity": "warning"
    }
  ]
}
```

---

### Dashboard 4: Security Monitoring

**Purpose:** Track authentication and security events

**Steps:**
```
1. Create new custom dashboard
   - Name: "Security"
   - Scope: Production
2. Add widgets:
   - [ ] 401 Unauthorized errors (graph)
   - [ ] 403 Forbidden errors (graph)
   - [ ] Authentication failures (total)
   - [ ] Login success rate (%)
   - [ ] Requests from unique IPs (geo map)
   - [ ] Rate limit hits (graph)
   - [ ] Webhook secret failures (count)
   - [ ] Failed attempts by source IP (table)
```

**Security Metrics:**
- Failed auth attempts/hour (target: < 10)
- Rate limit hits/hour (target: < 5)
- Unauthorized access attempts/hour (target: < 5)

---

### Dashboard 5: Business Metrics

**Purpose:** Track business-critical operations

**Steps:**
```
1. Create new custom dashboard
   - Name: "Business Metrics"
   - Scope: Production
2. Add widgets:
   - [ ] Lead intake requests/hour (graph)
   - [ ] Contract generation requests/hour
   - [ ] API requests by endpoint (breakdown)
   - [ ] Webhook processing success rate (%)
   - [ ] Lead intake latency (p95)
   - [ ] Contract generation latency (p95)
   - [ ] Total requests (24 hour)
   - [ ] Business operation errors (count)
```

**SLA Targets:**
- Lead intake success rate: > 99.5%
- Contract generation success rate: > 99%
- Lead intake latency (p95): < 300ms
- Contract generation latency (p95): < 2000ms

---

## Part 4: Set Up Alerts

### Alert 1: System Down

```
Condition: Deployment failed
Severity: Critical
Notification: Immediate email + SMS
Action: Auto-page on-call
Recipients: team-ops@company.com
```

### Alert 2: High Error Rate

```
Condition: 5xx errors > 5 in 5 minutes
Severity: Critical
Notification: Slack + Email
Action: Auto-snapshot logs
Recipients: #alerts channel
Threshold: 5 errors
Window: 5 minutes
```

### Alert 3: Performance Degradation

```
Condition: p95 response > 500ms for 10 min
Severity: High
Notification: Slack
Action: Auto-scale function memory
Recipients: #alerts channel
Duration: 10 minutes
```

### Alert 4: Auth Failure Spike

```
Condition: 401 errors > 20 in 5 minutes
Severity: High
Notification: Email + Slack
Action: Security investigation
Recipients: security-team@company.com
Threshold: 20 errors
Window: 5 minutes
```

### Alert 5: Memory Issues

```
Condition: Memory usage > 80% of limit
Severity: Medium
Notification: Slack
Action: Monitor and report
Recipients: #infrastructure channel
Threshold: 80% of 512MB = ~410MB
```

---

## Part 5: Configure Notifications

### Email Notifications

```
1. Go to Settings → Notifications
2. Configure email recipients:
   - [ ] team-ops@company.com (all alerts)
   - [ ] security-team@company.com (security alerts)
   - [ ] your-email@company.com (critical only)
3. Set notification rules:
   - Critical: Real-time
   - High: Real-time
   - Medium: Hourly digest
   - Low: Daily digest
4. Save and test
```

### Slack Integration

```
1. Go to Settings → Integrations
2. Click "Add Integration"
3. Choose "Slack"
4. Select workspace and channel
5. Authorize Vercel app
6. Configure channel mapping:
   - #alerts → Critical/High alerts
   - #infrastructure → Performance/System alerts
   - #business → Lead intake/feature alerts
7. Test integration:
   - Click "Send Test Notification"
   - Verify message appears in Slack
```

### PagerDuty Integration (Optional)

```
1. Create PagerDuty account (if needed)
2. Create service: "Agency Ops Suite"
3. In Vercel, go to Settings → Integrations
4. Add PagerDuty integration
5. Configure escalation policies
6. Link to production incidents
```

---

## Part 6: Dashboard Sharing & Access Control

### Create Read-Only Dashboard Share

```
1. Open dashboard (e.g., "System Health")
2. Click "Share" button (top right)
3. Generate public link:
   - Enable "Share dashboard"
   - Copy link
   - Set expiration (optional)
4. Share with:
   - Customer: https://vercel.com/share/dashboard/[id]
   - Team: Slack channel
   - Status page: Public link
```

### Dashboard Access Control

```
1. Go to Settings → Team
2. Add team members:
   - [ ] Ops engineers (full access)
   - [ ] Team lead (read + alerts)
   - [ ] Customer success (read-only)
3. Configure permissions:
   - Can edit dashboards
   - Can configure alerts
   - Can view logs
   - Can trigger deploys
4. Test access as each role
```

---

## Part 7: Verify Dashboards

### Checklist

- [ ] System Health dashboard created and showing data
- [ ] Performance dashboard tracking metrics
- [ ] Error Tracking dashboard monitoring errors
- [ ] Security dashboard tracking auth events
- [ ] Business Metrics dashboard showing lead intake
- [ ] All 5 alerts configured
- [ ] Email notifications tested
- [ ] Slack notifications tested
- [ ] Dashboard links working
- [ ] Team members have access

### Test Alerts

```bash
# Test 1: Trigger a 5xx error
curl https://agency-ops-suite.vercel.app/api/invalid-endpoint

# Test 2: Trigger auth failures (sends 401)
for i in {1..25}; do
  curl -H "Authorization: Bearer invalid" \
    https://agency-ops-suite.vercel.app/api/contracts &
done

# Test 3: Check dashboard updated
# Visit dashboard in 1-2 minutes, should show spikes
```

---

## Part 8: Ongoing Maintenance

### Daily Tasks (2 min)
- [ ] Check dashboard for red alerts
- [ ] Review error count
- [ ] Verify system up

### Weekly Tasks (15 min)
- [ ] Review performance metrics
- [ ] Check alert log
- [ ] Adjust thresholds if needed
- [ ] Review most common errors

### Monthly Tasks (1 hour)
- [ ] Full dashboard review
- [ ] Performance trend analysis
- [ ] Alert threshold optimization
- [ ] Capacity planning review

---

## Troubleshooting

### Dashboard Not Showing Data

**Problem:** Dashboard widgets show "No data"

**Solutions:**
1. Wait 5+ minutes for data collection
2. Ensure traffic is hitting the endpoint
3. Check that the function is deployed
4. Verify time range selection

### Alerts Not Firing

**Problem:** Alert conditions met but no notification

**Solutions:**
1. Check notification channel is configured
2. Verify alert threshold logic
3. Test alert with manual trigger
4. Check notification logs

### Missing Metrics

**Problem:** Some metrics not appearing in dashboard

**Solutions:**
1. Ensure Web Vitals enabled
2. Verify function monitoring enabled
3. Check dashboard refresh rate
4. Try different time window

---

## Reference: Dashboard Widget Types

| Widget Type | Best For | Configuration Time |
|-------------|----------|-------------------|
| Line Graph | Trends over time | 5 min |
| Bar Chart | Comparisons | 5 min |
| Number/Card | Single metric | 2 min |
| Gauge | Current status (0-100%) | 5 min |
| Table | Detailed breakdown | 10 min |
| Heat Map | Patterns over time | 10 min |
| Geo Map | Geographic distribution | 10 min |

---

## Complete Setup Time Estimate

| Task | Time |
|------|------|
| Enable Vercel Analytics | 5 min |
| Enable Function Monitoring | 5 min |
| Create System Health dashboard | 10 min |
| Create Performance dashboard | 10 min |
| Create Error Tracking dashboard | 10 min |
| Create Security dashboard | 10 min |
| Create Business Metrics dashboard | 10 min |
| Configure 5 alerts | 15 min |
| Set up notifications (Email + Slack) | 10 min |
| Test dashboards and alerts | 15 min |
| **TOTAL** | **~90 minutes** |

---

## Success Criteria

✅ **Setup Complete When:**
1. All 5 dashboards created and showing data
2. All 5 alerts configured and tested
3. Email and Slack notifications working
4. Team members can access dashboards
5. At least 1 alert successfully triggered during testing

---

## Next Steps After Setup

1. **Monitor First 24 Hours**
   - Verify all metrics being collected
   - Adjust alert thresholds if needed
   - Document baseline values

2. **Team Training**
   - Show team how to read dashboards
   - Explain alert response procedures
   - Practice incident response

3. **Ongoing Optimization**
   - Review weekly metrics
   - Adjust thresholds quarterly
   - Add new metrics as needed

---

**Dashboard Setup Guide Created:** May 13, 2026  
**Estimated Completion:** 90 minutes  
**Difficulty Level:** Easy-Medium  

