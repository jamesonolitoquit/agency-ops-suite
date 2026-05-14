# deployment-incidents.md

Production issues, how they were resolved, prevention measures.

## 1: Payment Webhook Timeouts

**Date:** [Date]
**Time to Detect:** 45 minutes
**Time to Resolve:** 2 hours
**User Impact:** 150 payments stuck in pending status

**Root Cause:**
- Email service degraded (5000ms latency vs normal 500ms)
- Webhook handler had no retry logic
- Payments timeout waiting for email confirmation

**Fix:**
- Added exponential backoff retry (3 attempts)
- Increased webhook timeout from 10s to 30s
- Added alert for slow email service

**Prevention:**
- Monitoring: Alert on email latency > 2s
- Test: Retry logic covered by unit tests
- Design: Always retry on transient failures

**Follow-up:**
- Email service switched to more reliable provider
- Webhook timeout tests added

---

## 2: [Future incident]

**Date:** [Date]
**Time to Detect:** [minutes]
**Time to Resolve:** [minutes]
**Impact:** [description]

**Root Cause:** [explanation]

**Fix:** [what we did]

**Prevention:** [how to avoid]

---

**Log incidents here for institutional memory.**
