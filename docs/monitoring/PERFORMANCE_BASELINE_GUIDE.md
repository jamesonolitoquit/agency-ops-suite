# Performance Baseline Metrics Collection Guide

**Date:** May 13, 2026  
**Status:** 🟡 READY FOR COLLECTION  
**Purpose:** Establish baseline metrics for ongoing performance monitoring  

---

## Executive Summary

This guide provides procedures to collect performance baseline metrics across all critical system components. Baseline metrics establish the "normal" performance characteristics, enabling effective alerting on anomalies.

### Key Metrics to Collect
- API response times (by endpoint)
- Database query performance
- Lead intake processing throughput
- Authentication latency
- Page load performance
- Error rates and types
- Resource utilization

### Collection Timeline
- **Phase 1 (Day 0):** Immediate collection (30 minutes)
- **Phase 2 (Week 1):** Full week of metrics
- **Phase 3 (Month 1):** Monthly baseline established

---

## SECTION 1: API Endpoint Performance

### Target Endpoints

| Endpoint | Type | Target p95 | Target p99 |
|----------|------|-----------|-----------|
| `/api/health` | GET | 50ms | 100ms |
| `/api/intake/lead` | POST | 200ms | 500ms |
| `/api/contracts` | GET | 150ms | 300ms |
| `/api/contracts` | POST | 300ms | 600ms |
| `/api/deployment-checklist` | GET | 100ms | 200ms |
| `/api/audit/[id]` | GET | 150ms | 300ms |

### Collection Method: Manual Curl Testing

#### Baseline Collection Script

```bash
#!/bin/bash
# performance-baseline.sh
# Collect response time measurements

DOMAIN="https://agency-ops-suite.vercel.app"
ITERATIONS=10
WARMUP=2

echo "=== API Performance Baseline Collection ==="
echo "Domain: $DOMAIN"
echo "Iterations: $ITERATIONS (after $WARMUP warmup)"
echo ""

# Test /api/health endpoint
echo "Testing: GET /api/health"
for i in $(seq 1 $((WARMUP + ITERATIONS))); do
  RESPONSE_TIME=$( \
    curl -w "%{time_total}" -o /dev/null -s "$DOMAIN/api/health"
  )
  
  if [ $i -gt $WARMUP ]; then
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
    echo "  Iteration $((i - WARMUP)): ${RESPONSE_MS}ms"
  fi
done
echo ""

# Test /api/contracts with authentication
echo "Testing: GET /api/contracts (requires auth)"
for i in $(seq 1 $((WARMUP + ITERATIONS))); do
  RESPONSE_TIME=$( \
    curl -w "%{time_total}" -o /dev/null -s \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$DOMAIN/api/contracts"
  )
  
  if [ $i -gt $WARMUP ]; then
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
    echo "  Iteration $((i - WARMUP)): ${RESPONSE_MS}ms"
  fi
done
echo ""

# Test /api/intake/lead webhook
echo "Testing: POST /api/intake/lead (webhook)"
for i in $(seq 1 $((WARMUP + ITERATIONS))); do
  RESPONSE_TIME=$( \
    curl -w "%{time_total}" -o /dev/null -s \
    -X POST "$DOMAIN/api/intake/lead" \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d '{"name":"Test","email":"test@example.com","source":"google"}'
  )
  
  if [ $i -gt $WARMUP ]; then
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
    echo "  Iteration $((i - WARMUP)): ${RESPONSE_MS}ms"
  fi
done

echo ""
echo "=== Baseline Collection Complete ==="
```

### Collection Instructions

1. **Warm up the service** (run 2-5 requests to initialize)
2. **Collect measurements** (run 10+ requests per endpoint)
3. **Record times** (milliseconds for response time)
4. **Calculate statistics**:
   - Mean (average)
   - Median (50th percentile)
   - p95 (95th percentile)
   - p99 (99th percentile)
   - Min/Max

### Expected Baseline Results

Based on Vercel deployments with Supabase:

| Endpoint | Mean | p95 | p99 |
|----------|------|-----|-----|
| `/api/health` | 60ms | 100ms | 150ms |
| `/api/intake/lead` | 150ms | 250ms | 400ms |
| `/api/contracts` | 120ms | 200ms | 300ms |
| `/api/deployment-checklist` | 90ms | 150ms | 250ms |

---

## SECTION 2: Database Query Performance

### Query Performance Metrics

**Location:** Check Supabase dashboard for query performance

**Steps:**
1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Run test queries and observe execution time
4. Record times in baseline document

### Key Queries to Test

#### Query 1: List All Leads (Paginated)

```sql
SELECT id, name, email, status, created_at 
FROM leads 
ORDER BY created_at DESC 
LIMIT 20;
```

**Target Performance:** < 50ms

#### Query 2: Get Lead with Related Records

```sql
SELECT 
  l.id, l.name, l.email,
  COUNT(c.id) as contract_count,
  COUNT(p.id) as proposal_count
FROM leads l
LEFT JOIN contracts c ON l.id = c.lead_id
LEFT JOIN proposals p ON l.id = p.lead_id
WHERE l.id = $1
GROUP BY l.id;
```

**Target Performance:** < 100ms

#### Query 3: Count Records by Status

```sql
SELECT status, COUNT(*) as count
FROM leads
GROUP BY status;
```

**Target Performance:** < 50ms

#### Query 4: Recent Audit Logs

```sql
SELECT id, action, actor_email, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 100;
```

**Target Performance:** < 100ms

### Collection Method

**Month 1 Baseline:**
- Record query execution time from Supabase logs
- Average of 10+ runs per query
- Note any slow queries (> 200ms)

---

## SECTION 3: Lead Intake Webhook Performance

### Throughput Test

**Purpose:** Measure how many lead intake requests per second

**Setup:**
1. Create test webhook client
2. Send parallel lead intake requests
3. Measure success rate and response times

### Test Scenario

```json
{
  "name": "Test Lead",
  "email": "test@example.com",
  "businessType": "SaaS",
  "company": "Acme Corp",
  "source": "google",
  "message": "Interested in services"
}
```

### Performance Targets

| Metric | Target |
|--------|--------|
| Throughput | 100+ req/sec |
| Error Rate | < 0.1% |
| Response Time (p95) | < 300ms |
| Rate Limit | 30 req/min per IP |

### Collection Procedure

```bash
# Test throughput with multiple parallel requests
for i in {1..10}; do
  curl -X POST https://agency-ops-suite.vercel.app/api/intake/lead \
    -H "Content-Type: application/json" \
    -H "x-webhook-secret: $WEBHOOK_SECRET" \
    -d "{\"name\":\"Lead $i\",\"email\":\"lead$i@test.com\",\"source\":\"google\"}" \
    & 
done
wait

# Measure: How many succeeded? How fast?
```

---

## SECTION 4: Authentication Performance

### Login Flow Latency

**Components:**
1. Password submission → 0ms (form submit)
2. Authentication request → 100-200ms
3. Token generation → 50-100ms
4. Session initialization → 100-150ms
5. Dashboard load → 500-1000ms

**Total Expected:** 750-1450ms

### Measurement Steps

1. Open browser DevTools (Network tab)
2. Clear cache
3. Click "Login"
4. Enter credentials
5. Submit form
6. Observe timing:
   - `auth/v1/token` request (expect 100-200ms)
   - `auth/v1/user` request (expect 50-100ms)
   - Dashboard initial load (expect 500-800ms)

### Performance Targets

| Phase | Target |
|-------|--------|
| Token exchange | 100-200ms |
| User fetch | 50-100ms |
| Session init | 100-150ms |
| Dashboard load | 500-800ms |
| **Total** | **< 2000ms** |

---

## SECTION 5: Page Load Performance

### Metrics to Measure

Using Chrome DevTools or Lighthouse:

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1s | 1.8s |
| Largest Contentful Paint (LCP) | < 2.5s | 4.0s |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.25 |
| Time to Interactive (TTI) | < 3.5s | 5.0s |

### Measurement Steps

1. Open production dashboard: https://agency-ops-suite.vercel.app
2. Open Chrome DevTools → Lighthouse
3. Run audit (Desktop)
4. Record scores for each metric
5. Repeat for each main page:
   - Dashboard (/)
   - Leads (/leads)
   - Clients (/clients)
   - Billing (/billing)

### Collection Tools

**Option 1: Chrome Lighthouse (Manual)**
- Quick but not automated
- Good for spot-checking

**Option 2: Vercel Analytics (Automatic)**
- Set up in Vercel dashboard
- Automatic data collection
- Recommended for baselines

**Steps for Vercel Analytics:**
1. Go to Vercel Project Settings
2. Navigate to Analytics
3. Enable Web Vitals
4. View baseline data after 24-48 hours

---

## SECTION 6: Error Rates & Reliability

### Error Rate Monitoring

**Sources of Error Data:**
1. Application logs (logs/server.log)
2. API response status codes
3. Supabase error logs
4. Browser console errors

### Error Categories

| Type | Target | Acceptable |
|------|--------|-----------|
| 5xx Server Errors | < 0.01% | < 0.1% |
| 4xx Client Errors | < 0.5% | < 2% |
| 401 Auth Errors | < 0.1% | < 0.5% |
| Database Errors | < 0.01% | < 0.05% |

### Collection Method

**Week 1 Baseline:**
1. Aggregate all errors from logs
2. Calculate error rate: `errors / total_requests`
3. Break down by type and endpoint
4. Identify any patterns

### Error Tracking Setup

**Log Parsing Script:**
```bash
#!/bin/bash
# Extract errors from server logs

echo "=== Error Rate Analysis ==="

# Count total requests (approximate)
TOTAL_ENTRIES=$(wc -l logs/server.log | awk '{print $1}')

# Count errors
ERROR_COUNT=$(grep -c '"level":"error"' logs/server.log)

# Calculate error rate
ERROR_RATE=$(echo "scale=4; $ERROR_COUNT / $TOTAL_ENTRIES * 100" | bc)

echo "Total log entries: $TOTAL_ENTRIES"
echo "Errors: $ERROR_COUNT"
echo "Error rate: $ERROR_RATE%"

# Break down errors by type
echo ""
echo "Error breakdown:"
grep '"level":"error"' logs/server.log | \
  jq '.message' | \
  sort | uniq -c | sort -rn | head -10
```

---

## SECTION 7: Resource Utilization

### Memory Usage

**Monitor via Vercel Dashboard:**
1. Go to project settings
2. Check Function Logs
3. Monitor memory usage of serverless functions

**Baseline Targets:**
- Memory usage: < 512MB per function
- Memory growth rate: 0 (no leaks)

### Database Connections

**Monitor via Supabase Dashboard:**
1. Go to Database → Connections
2. Check active connection count
3. Monitor for connections trending upward

**Baseline Targets:**
- Active connections: 5-20
- Idle connections: < 50

### Storage Usage

**Database Storage:**
1. Supabase Dashboard → Database → Usage
2. Record total database size
3. Track growth rate

**Expected Baseline:**
- Initial size: 10-50MB (schema + seed data)
- Growth rate: < 10MB/week initially

---

## SECTION 8: Baseline Collection Template

### Performance Baseline Report Template

```markdown
# Performance Baseline Report
**Collection Date:** [DATE]  
**Collected By:** [NAME]  

## API Performance

### GET /api/health
- Mean: [ms]
- p95: [ms]
- p99: [ms]
- Samples: [number]

### POST /api/intake/lead
- Mean: [ms]
- p95: [ms]
- p99: [ms]
- Samples: [number]
- Success Rate: [%]

### GET /api/contracts
- Mean: [ms]
- p95: [ms]
- p99: [ms]
- Samples: [number]

## Database Performance

### Query: List Leads
- Execution Time: [ms]
- Sample Size: [number]
- Indexes: [yes/no]

### Query: Get Lead Details
- Execution Time: [ms]
- Sample Size: [number]

## Page Load Performance

### Dashboard (/)
- FCP: [ms]
- LCP: [ms]
- TTI: [ms]
- CLS: [value]

### Leads Page (/leads)
- FCP: [ms]
- LCP: [ms]
- TTI: [ms]
- CLS: [value]

## Error Rates

- 5xx Errors: [count] ([%])
- 4xx Errors: [count] ([%])
- 401 Auth Errors: [count] ([%])
- Database Errors: [count] ([%])

## Resource Utilization

- Memory Usage: [MB]
- Database Connections: [count]
- Database Size: [MB]
- Storage Growth Rate: [MB/week]

## Notes & Observations

[Any unusual patterns or concerns]

---

**Baseline Status:** ✅ APPROVED FOR USE
```

---

## Collection Timeline & Responsibilities

### Day 0 (Immediate)
- [ ] API endpoint testing (30 min)
- [ ] Page load performance audit (30 min)
- [ ] Initial error rate analysis (20 min)

### Week 1 (Ongoing)
- [ ] Continuous API monitoring
- [ ] Database query analysis
- [ ] Webhook throughput testing
- [ ] Error pattern identification

### Month 1 (Consolidation)
- [ ] Monthly baseline report
- [ ] Trend analysis
- [ ] Identification of optimization opportunities
- [ ] Alert threshold configuration

---

## Using Baselines for Alerting

### Alert Configuration Strategy

**Step 1: Calculate Alert Thresholds**
```
Alert Threshold = Baseline p95 * 1.5

Example:
- Baseline p95 for /api/health: 100ms
- Alert threshold: 100ms * 1.5 = 150ms
- Alert when p95 > 150ms
```

**Step 2: Set Alert Sensitivity**
- Tight: Alert at 1.2x baseline (sensitive, may have false positives)
- Normal: Alert at 1.5x baseline (recommended)
- Loose: Alert at 2.0x baseline (only severe degradation)

**Step 3: Configure Monitoring Tool**
- Use Vercel Analytics for page load metrics
- Use Supabase logs for database metrics
- Use application logs for API metrics

---

## Common Performance Issues & Solutions

### Issue 1: Slow API Response Times
**Causes:**
- Database query not indexed
- N+1 query problem
- Large response payload

**Investigation:**
1. Check database query execution time
2. Review query logs for full table scans
3. Profile application code

### Issue 2: High Memory Usage
**Causes:**
- Memory leak in application
- Large data structures in memory
- Inefficient caching

**Investigation:**
1. Monitor memory growth over time
2. Check for unclosed connections
3. Review object lifecycle

### Issue 3: Database Connection Pool Exhaustion
**Causes:**
- Too many simultaneous connections
- Connections not being released
- Connection timeout too long

**Investigation:**
1. Check connection pool usage
2. Monitor for long-running queries
3. Review connection lifecycle

---

## Next Steps

1. **Immediate (Today):**
   - [ ] Run initial API performance tests
   - [ ] Collect page load baselines
   - [ ] Analyze error rates

2. **This Week:**
   - [ ] Complete full baseline collection
   - [ ] Identify optimization opportunities
   - [ ] Configure monitoring

3. **Next Month:**
   - [ ] Establish monthly baseline report
   - [ ] Configure automated alerts
   - [ ] Plan performance improvements

---

**Collection Guide Created:** May 13, 2026  
**Ready for Baseline Collection:** ✅ YES  
**Estimated Collection Time:** 4-6 hours spread over 1 month  

