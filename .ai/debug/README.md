# Debug — Systematic Problem-Solving Methodology

Structured approaches for debugging and incident response.

## Files

| File | Purpose |
|------|----------|
| **root-cause-analysis.md** | Debugging procedure: symptom → root cause → fix → prevention |
| **incident-response.md** | Production emergency handling: triage → investigation → fix → comms |

## When to Use

**Bug investigation:**
1. Follow root-cause-analysis.md
2. Step 1: Define symptom
3. Step 2: Gather evidence
4. Step 3-7: Systematic debugging
5. Document in memory/known-bugs.md

**Production emergency:**
1. Follow incident-response.md
2. Triage severity
3. Mitigation first (reduce damage)
4. Investigation (root cause)
5. Fix (minimal change)
6. Communication (status updates)

## Key Principle

**Systematic debugging prevents guess-and-check chaos.**

- Don't fix symptoms, fix root causes
- Always ask "Why did this happen?"
- Always add prevention measure
- Always document for team

## Results

When you follow these procedures:
- Shorter time-to-fix
- Fewer regressions
- Less firefighting
- Better team learning

## Debug Procedure

```
Symptom Reported
    ↓
Load root-cause-analysis.md
    ↓
1. Define the problem
   - When did it start?
   - Who does it affect?
   - How reproducible?
   
2. Gather evidence
   - Check logs
   - Review metrics
   - Get reproduction steps
   
3. Form hypotheses
   - Recent deploys?
   - Data changes?
   - Infrastructure issues?
   
4. Test systematically
   - Isolate subsystems
   - Check dependencies
   - Verify assumptions
   
5. Identify root cause
   - Not the symptom, the actual problem
   - Document the chain
   
6. Propose minimal fix
   - Smallest safe change
   - Doesn't introduce new risks
   
7. Prevent recurrence
   - Add test
   - Add monitoring
   - Document lesson
```

## Debug Workflow Template

```markdown
# Debugging: [Issue Description]

## Symptom
- What: Payment confirmation not sending
- When: Started yesterday at 2pm UTC
- Who: ~5% of users
- Reproducible: Intermittently

## Initial Triage
- Severity: HIGH (users can't confirm payments)
- Status: Investigating
- On-call: [Name]

## Gathering Evidence

### Check Logs
```
grep "payment.*error" logs/2024-01-15.log | head -20
```
Finding: "Timeout connecting to email service"

### Check Metrics
- Email API latency: 5000ms (normal: 500ms)
- Email service error rate: 15% (normal: <1%)

### Reproduction
- Can reproduce: Create test payment, confirmation doesn't send

## Hypothesis
Email service degradation causing timeouts.

### Testing
- Check email service status: Investigating incident
- Check our retry logic: Retries 0 times on timeout
- Check queue: Payment jobs never enqueue

## Root Cause
🎯 Email service experiencing issues + our code doesn't retry

## Fix
Add exponential backoff retry in send-confirmation email function:

```typescript
async function sendConfirmation(email: string) {
  for (let i = 0; i < 3; i++) {
    try {
      return await emailService.send({...});
    } catch (err) {
      if (i < 2) {
        await delay(Math.pow(2, i) * 1000); // Exponential backoff
      } else {
        throw err; // On final attempt, fail
      }
    }
  }
}
```

## Verification
- [ ] Fix deployed to staging
- [ ] Manual test passes
- [ ] Email service recovers
- [ ] Monitor production confirmations
- [ ] Email service RCA completed

## Prevention
- [ ] Add monitoring alert for email timeouts
- [ ] Add test for retry behavior
- [ ] Document email service dependency

## Post-Mortem
- Link to incident review
```

## Debugging Best Practices

1. **Understand First** — Don't jump to conclusions
2. **Isolate Systematically** — Narrow down possibility space
3. **Change One Thing** — Make single changes between tests
4. **Keep Evidence** — Save logs, screenshots, data
5. **Think Clearly** — Step back if frustrated
6. **Document** — Make your thinking clear
7. **Prevent** — Add monitoring/tests to catch it next time

The best debugging is prevention.
