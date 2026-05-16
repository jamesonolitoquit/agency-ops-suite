# optimize-application.md

Systematic performance optimization cycle.

## Stages

**Stage 1: Profiling** (performance-engineer)
- Measure current state
- Baseline metrics recorded
- Identify slow operation

**Stage 2: Bottleneck Analysis** (performance-engineer)
- Command: optimize-performance.md (profiling phase)
- Answer: What's slow? Why?
- Identify root cause

**Stage 3: Optimization Planning** (performance-engineer + relevant role)
- Design optimization approach
- Estimate improvement
- Identify trade-offs

**Stage 4: Implementation** (relevant domain engineer)
- UI optimization → ui-systems-engineer
- API optimization → backend-api-architect
- Database optimization → backend-api-architect

**Stage 5: Measurement** (performance-engineer)
- Measure after optimization
- Compare: before vs after
- Quantify improvement
- Verify no regressions

**Stage 6: Deployment** (deployment-engineer)
- Deploy to staging first
- Monitor performance in staging
- Deploy to production
- Monitor metrics in production

**Stage 7: Review & Documentation** (performance-engineer)
- Document optimization applied
- Save metrics to memory/optimization-history.md
- Review: was improvement worth effort?

## Optimization Types

| Type | Typical Savings | Effort |
|------|-----------------|--------|
| Lazy loading | 20-50% | Medium |
| Memoization | 10-30% | Low |
| Query optimization | 30-80% | High |
| Image optimization | 10-40% | Low |
| Bundle splitting | 15-40% | Medium |
| Caching strategy | 30-70% | Medium |
| Algorithm improvement | 50-90% | High |

## Success Criteria

- [ ] Baseline measured
- [ ] Bottleneck identified
- [ ] Improvement measured (not guessed)
- [ ] No regressions
- [ ] User-facing benefit

## Output

```
📊 Performance Optimization Complete

Metrics:
- Before: [measurement]
- After: [measurement]
- Improvement: [%]
- User impact: [description]

Implementation:
- Code changes: [summary]
- Effort: [hours]
- ROI: High/Medium/Low
```

## Timeline

Typical: 4-24 hours depending on optimization scope

Used by: workflow-dispatcher.md (domain: PERFORMANCE_OPTIMIZATION)
