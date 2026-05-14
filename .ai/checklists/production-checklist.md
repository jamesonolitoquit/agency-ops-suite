# production-checklist.md

Pre-production deployment validation.

## Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] No TODO comments (move to issues)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript strict mode clean (no `any`, `@ts-ignore`)
- [ ] No dead code or unused imports

## Performance

- [ ] Lighthouse score >= 90 (Performance)
- [ ] Core Web Vitals acceptable
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Bundle size reasonable (< 300KB gzipped)
- [ ] No N+1 queries
- [ ] API responses < 1s

## Security

- [ ] No secrets in code
- [ ] Secrets in environment variables
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Auth required for protected routes
- [ ] HTTPS everywhere
- [ ] No XSS vulnerabilities
- [ ] No SQL injection vulnerabilities

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliance
- [ ] Images have alt text
- [ ] Color contrast adequate (4.5:1)
- [ ] Focus visible

## Testing

- [ ] Unit tests: >= 80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] No flaky tests
- [ ] Critical paths tested

## Configuration

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Secrets configured
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Backups verified

## Monitoring

- [ ] Health check endpoint working
- [ ] Error alerts configured
- [ ] Performance alerts configured
- [ ] Uptime monitoring active
- [ ] Log aggregation active

## Documentation

- [ ] README updated
- [ ] API documentation complete
- [ ] Deployment documented
- [ ] Known limitations documented

## Sign-Off

- [ ] Lead engineer approved
- [ ] Security review passed
- [ ] Product review approved
- [ ] QA sign-off received

---

**Do not deploy without all boxes checked.**
