# Checklists — Operational Validation Systems

Pre-flight checklists for critical operations.

## Files

| File | Purpose | Use When |
|------|---------|----------|
| **production-checklist.md** | Pre-deployment validation | Before deploying to production |
| **security-checklist.md** | Security audit & hardening | Before public release |
| **accessibility-checklist.md** | WCAG compliance validation | Before feature launch |
| **launch-checklist.md** | Final go/no-go decision | Before public launch |

## Usage

**Deploy to production:**
1. Run production-checklist.md
2. Check every box
3. Get sign-offs
4. Deploy

**Audit for security:**
1. Run security-checklist.md
2. Fix any gaps
3. Document exceptions
4. Get security approval

**Launch feature:**
1. Run production-checklist.md
2. Run security-checklist.md
3. Run accessibility-checklist.md
4. Run launch-checklist.md
5. All pass → Launch
6. Any fail → Fix → Re-run

## Key Principle

**Checklists prevent human error at critical moments.**

These are your safety nets. Use them religiously.

- Reduces missed requirements
- Documents verification performed
- Provides audit trail
- Builds team confidence

### Code & Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All e2e tests pass
- [ ] Test coverage >= 80%
- [ ] No console errors/warnings
- [ ] No TypeScript errors
- [ ] ESLint passes with 0 warnings
- [ ] Code reviewed and approved
- [ ] All PR comments resolved

### Functionality
- [ ] Feature works as specified
- [ ] All happy paths tested
- [ ] All error paths tested
- [ ] Works on Chrome (latest)
- [ ] Works on Firefox (latest)
- [ ] Works on Safari (latest)
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768-1024px)
- [ ] Works with keyboard only
- [ ] Works with screen reader

### Performance
- [ ] Lighthouse score >= 90
- [ ] First Contentful Paint < 2.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No unexpected bundle size increase
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] API response times < 500ms
- [ ] Images optimized and lazy-loaded

### Security
- [ ] No exposed API keys or secrets
- [ ] All user inputs validated
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] XSS protection verified
- [ ] Rate limiting configured
- [ ] Auth guards verified
- [ ] Database permissions correct
- [ ] Security headers present

### Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Component documentation added
- [ ] Architecture documentation updated
- [ ] User-facing docs updated
- [ ] Known limitations documented
- [ ] Migration guide (if applicable)

### Monitoring & Alerts
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] User analytics configured
- [ ] Alerts configured for critical issues
- [ ] Dashboard created for monitoring

### Deployment
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Rollback procedure documented
- [ ] On-call engineer informed
- [ ] Status page updated
- [ ] Announcement prepared

## Launch Window

- [ ] Final smoke tests pass
- [ ] Team standing by
- [ ] Metrics baseline recorded
- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Check error tracking
- [ ] Monitor for issues (first hour)
- [ ] Announce to users

## Post-Launch

- [ ] Monitor metrics for 24 hours
- [ ] Respond to user feedback
- [ ] Fix any critical issues
- [ ] Document lessons learned
- [ ] Celebrate successful launch!

## Sign-Off
- Feature Owner: _______________  Date: _______
- QA Lead: _______________  Date: _______
- DevOps Lead: _______________  Date: _______
```

## Checklist Usage

**Before using a checklist:**
1. Read the objective
2. Understand the context
3. Gather necessary tools/info

**While using a checklist:**
1. Go through each item
2. Mark complete only if verified
3. Document any issues found
4. Note any new items to add

**After using a checklist:**
1. Ensure all critical items checked
2. Escalate any blockers
3. Archive completed checklist
4. Continuously improve the checklist

## Making Checklists Effective

- **Concise** — Each item is specific and actionable
- **Realistic** — Takes reasonable time to complete
- **Progressive** — Builds from critical to nice-to-have
- **Measurable** — Clear pass/fail criteria
- **Evolving** — Improve based on what you learn

Checklists should feel helpful, not bureaucratic.
