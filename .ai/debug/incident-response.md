# incident-response.md

Production emergency handling procedure.

## Severity Assessment

| Severity | Impact | Action |
|----------|--------|--------|
| CRITICAL | All users, data loss, security | Immediate page/call on-call |
| HIGH | Many users, service degraded | Page on-call within 15 min |
| MEDIUM | Some users affected | Alert, plan fix |
| LOW | Edge cases, non-blocking | Add to backlog |

## Response Steps

### 1. Triage (Immediately)
- Assess severity
- Notify stakeholders
- Start incident tracking
- Begin investigation

### 2. Mitigation (First 10 min)
- Can we reduce impact without fixing?
- Can we route traffic away?
- Can we scale resources?

### 3. Investigation (Ongoing)
- Debug: root-cause-analysis.md
- Identify fix approach
- Estimate time to fix

### 4. Fix (When identified)
- Deploy minimal fix to staging first
- Test fix
- Deploy to production
- Monitor closely (1 hour)

### 5. Recovery
- If fix works: monitor 24 hours
- If fix fails: rollback immediately
- Start new investigation

### 6. Communication
- Update status page
- Notify affected users
- Provide ETA
- Post resolution update

### 7. Post-Mortem (24-48 hours)
- What happened?
- Root cause?
- What could prevent this?
- Action items

## Escalation

```
15 min: No progress → Escalate to senior engineer
30 min: Still ongoing → Escalate to team lead
1 hour: Still ongoing → Full team mobilization
```

## Template

```
INCIDENT: [Name]
Severity: [CRITICAL|HIGH|MEDIUM|LOW]
Started: [time]
Detected: [time]
Resolved: [time]

Impact:
- Users affected: [count/percentage]
- Services down: [list]
- Data affected: [description]

Root cause: [explanation]

Resolution:
- Action taken: [steps]
- Fix deployed: [time]
- Verified: [how]

Prevention:
- Monitoring alert added
- Code change: [link]
- Test added: [description]
```
