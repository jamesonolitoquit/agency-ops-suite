# ship-production-release.md

Production-ready deployment with safety gates.

## Pre-Deployment Checklist (24 hours before)

- [ ] All tests pass (unit, integration, e2e)
- [ ] Test coverage > 80%
- [ ] No critical issues open
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Accessibility verified
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Environment variables configured
- [ ] Monitoring configured
- [ ] Rollback procedure tested

## Staging Deployment

**Stage 1: Build**
- Run full test suite
- Verify build succeeds
- Bundle size acceptable?

**Stage 2: Deploy to Staging**
- deployment-engineer deploys
- Verify deployment successful

**Stage 3: Smoke Tests**
- Run critical user flows
- Check error tracking
- Monitor metrics

**Stage 4: Gate**
- Everything working? → Proceed
- Issues found? → Fix and redeploy

## Production Deployment

**Stage 1: Pre-Deploy Communication**
- Notify support team
- Update status page
- Team standby

**Stage 2: Blue-Green Deploy** (if available)
- Deploy to green environment
- Verify it's working
- Switch traffic from blue to green

**Or: Rolling Deploy**
- Deploy to first instance
- Wait for health checks
- Deploy to remaining instances

**Stage 3: Health Checks**
- Error rates normal?
- Response times normal?
- Database connected?
- All services responding?

**Stage 4: Monitoring** (first hour)
- Watch error rates
- Watch performance metrics
- Watch user impact
- Be ready to rollback

**Stage 5: Post-Deployment**
- Update status page
- Notify stakeholders
- Schedule follow-up review

## Rollback Procedure

If critical issue found:
1. Execute rollback (revert to previous version)
2. Verify old version working
3. Notify team
4. Begin incident response
5. Root cause analysis
6. Re-plan deployment

## Output

```
✅ Production Deployment Complete

Deployment:
- Started: [time]
- Completed: [time]
- Version: [version]
- Rollback tested: yes

Verification:
- Health checks: PASS
- Error tracking: Normal
- Performance: Normal
- User reports: None

Next: Monitor for 24 hours
```

## Success Criteria

- [ ] Deployed without errors
- [ ] All health checks pass
- [ ] Error rates normal
- [ ] Performance normal
- [ ] No user complaints (1 hour)

Used by: workflow-dispatcher.md (domain: DEPLOYMENT)
