# build-feature.md

End-to-end feature development from planning through production deployment.

## Stages

**Stage 1: Planning** (system-architect)
- Command: plan-feature.md
- Deliverable: Architecture document, API spec, DB schema
- Gate: Architecture reviewed, no major questions

**Stage 2: Implementation** (backend-api-architect OR ui-systems-engineer)
- Command: build-api-route.md OR implement-component.md
- Deliverable: Code, tests, docs
- Gate: Tests pass (>80% coverage), no console errors

**Stage 3: Security Validation** (security-engineer)
- Scanner: security-boost.md
- Deliverable: Security assessment
- Gate: No critical or high-severity issues

**Stage 4: Quality Assurance** (performance-engineer + qa-specialist)
- Scanner: performance-audit.md, ux-consistency.md
- Deliverable: Quality report
- Gate: Performance acceptable, accessibility checked

**Stage 5: Code Review** (senior engineer)
- Command: review-pr.md
- Deliverable: PR review
- Gate: Approved with no blockers

**Stage 6: Staging Deployment** (deployment-engineer)
- Command: ship-production-release.md (staging)
- Deliverable: Staging deployment proof
- Gate: Staging tests pass, smoke tests pass

**Stage 7: Production Deployment** (deployment-engineer)
- Command: ship-production-release.md (production)
- Deliverable: Production deployment confirmation
- Gate: Health checks pass, monitoring active

## Failure Recovery

| Stage | Failure | Action |
|-------|---------|--------|
| 1-2 | Architecture issue | Restart planning |
| 3 | Implementation bug | Fix code, re-run stage 2 |
| 4 | Security issue | Fix code, re-run stage 3 |
| 5 | Performance issue | Optimize, re-run stage 4 |
| 6 | Review fails | Address feedback, re-run stage 5 |
| 7 | Staging fails | Debug, fix, re-run stage 6 |
| 8 | Production fails | Rollback, incident response |

## Output

```
✅ Feature delivered to production
├── Architecture reviewed
├── Code tested (coverage: XX%)
├── Security validated
├── Performance metrics: PASS
├── PR approved
├── Deployed to staging (verified)
└── Deployed to production (monitoring active)
```

## Timeline

Typical: 8-40 hours depending on complexity

Used by: workflow-dispatcher.md
