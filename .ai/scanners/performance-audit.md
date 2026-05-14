# performance-audit.md

Identifies performance bottlenecks and optimization opportunities.

## Checks

**Frontend**
- Unnecessary re-renders (missing memoization)
- Large components (slow render)
- Waterfall requests (sequential instead of parallel)
- Large JavaScript bundles
- Missing image optimization
- Large bundle chunks

**Backend & Database**
- N+1 query patterns
- Missing indexes
- Slow queries (> 500ms)
- Missing query pagination
- Database connection issues

**Metrics**
- Lighthouse score < 90
- First Contentful Paint > 2.5s
- Largest Contentful Paint > 2.5s
- Cumulative Layout Shift > 0.1

## Severity

| Issue | Severity |
|-------|----------|
| LCP > 4s | CRITICAL |
| N+1 query | HIGH |
| Bundle > 500KB | HIGH |
| Unnecessary rerender | MEDIUM |
| Image not optimized | MEDIUM |

## Output

```
Performance Audit Report

Metrics:
- Lighthouse: 75/100 [MEDIUM]
- FCP: 3.2s [HIGH - should be < 2.5s]
- LCP: 2.1s [GOOD]
- CLS: 0.15 [HIGH - should be < 0.1]

Issues:
1. N+1 queries on dashboard load [HIGH]
   → Optimization: Use JOIN instead of loop queries
   
2. Hero image not optimized [MEDIUM]
   → Optimization: Use WebP, lazy load

3. Dashboard rerenders on every keystroke [MEDIUM]
   → Optimization: Use useMemo, useCallback
```

## Automation

- Lighthouse CI
- Bundle analyzer
- Query analyzer
- Chrome DevTools profiling
- APM monitoring

Trigger: On PR, production monitoring
