# launch-checklist.md

Final pre-launch validation before public release.

## Product Readiness

- [ ] Core features completed
- [ ] User feedback incorporated
- [ ] Product lead sign-off received
- [ ] Scope frozen (no new features)
- [ ] Known issues documented
- [ ] Limitations documented

## Technical Quality

- [ ] Production checklist complete
- [ ] Security checklist complete
- [ ] Accessibility checklist complete
- [ ] Performance targets met
- [ ] Uptime target met in staging
- [ ] Load testing passed (projected 2x traffic)

## Testing

- [ ] All automated tests passing
- [ ] Manual QA testing complete
- [ ] User acceptance testing (UAT) approved
- [ ] E2E test suite passing
- [ ] Smoke tests written and passing
- [ ] Regression test suite passing

## Documentation

- [ ] User guide complete
- [ ] API documentation complete
- [ ] Deployment guide complete
- [ ] Runbook written (how to operate)
- [ ] Known issues documented
- [ ] FAQ created

## Team Preparation

- [ ] Support trained (if applicable)
- [ ] On-call rotation set
- [ ] Escalation procedures defined
- [ ] Incident response plan ready
- [ ] Communication plan ready
- [ ] Team briefing complete

## Launch Day

- [ ] Health checks configured
- [ ] Monitoring enabled
- [ ] Alerts active
- [ ] Status page ready
- [ ] Support team ready
- [ ] On-call engineer assigned
- [ ] Rollback plan verified
- [ ] Communication channels open

## Deployment

- [ ] Staging deployment successful
- [ ] Health checks passing in staging
- [ ] 1-hour soak test in staging
- [ ] No errors in staging logs
- [ ] Production deployment plan reviewed
- [ ] Deployment executed successfully
- [ ] Health checks passing in production
- [ ] Monitoring showing normal metrics

## Post-Launch (First 24h)

- [ ] Monitor error rates (should be ~0% new errors)
- [ ] Monitor performance (should be < 1s p95)
- [ ] Monitor uptime (should be 99.9%+)
- [ ] Monitor user feedback
- [ ] No critical issues reported
- [ ] Performance stable

## Sign-Off

- [ ] Product: Ready ✅
- [ ] Engineering: Ready ✅
- [ ] QA: Ready ✅
- [ ] Security: Ready ✅
- [ ] Operations: Ready ✅

---

**Do not launch without 100% completion.**
