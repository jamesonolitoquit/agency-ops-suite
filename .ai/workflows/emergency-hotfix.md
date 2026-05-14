# emergency-hotfix.md

Rapid response to critical production issues.

## Stages

**Stage 1: Triage** (on-call engineer)
- Assess severity (user impact, data loss risk)
- Notify stakeholders if critical
- Begin investigation

**Stage 2: Analysis** (senior-debug-engineer)
- Command: analyze-bug.md
- Identify root cause
- Design minimal fix
- Estimate impact

**Stage 3: Minimal Fix** (relevant domain engineer)
- Implement smallest possible fix
- Do NOT refactor
- Do NOT optimize
- Just fix the problem

**Stage 4: Testing** (qa-specialist)
- Test fix locally
- Test in staging if time permits
- Verify no new issues

**Stage 5: Deployment** (deployment-engineer)
- Immediate production deployment
- Monitor closely for 1 hour
- Be ready to rollback

**Stage 6: Communication** (on-call engineer)
- Update status page
- Notify affected users
- Post incident summary

**Stage 7: Post-Mortem** (team)
- Root cause deep dive
- Prevention measures
- Add to memory/known-bugs.md

## Decision Thresholds

| Severity | Action |
|----------|--------|
| Critical (data loss, all users affected) | Deploy immediately, post-mortem later |
| High (many users affected) | Test in staging, then deploy |
| Medium (some users affected) | Test thoroughly, normal review |
| Low | Wait for next release |

## Failure Recovery

If fix causes new issues:
1. Rollback immediately (revert commit)
2. Alert team
3. Restart hotfix process
4. Root cause why fix broke things

## Output

```
🚨 Hotfix deployed
├── Issue: [description]
├── Root cause: [explanation]
├── Fix: [summary]
├── Deployed: [timestamp]
├── Rollback ready: yes
└── Post-mortem: [scheduled]
```

## Timeline

Typical: 15-60 minutes from detection to deployment

Used by: workflow-dispatcher.md (EMERGENCY override)
