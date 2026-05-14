# optimize-performance.md

Profiling, identifying bottlenecks, implementing optimizations.

## Objective

Make specific system faster with quantified improvements.

## Prerequisites

- Performance problem identified
- Baseline metrics recorded
- performance-engineer leads
- Real user data available (if possible)

## Workflow

**1. Profile Current State**
- Identify slow operation
- Measure: time, memory, bundle
- Capture baseline metrics

**2. Identify Bottleneck**
- Where's the time going?
- CPU-bound or I/O-bound?
- Frontend or backend?

**3. Find Root Cause**
- Why is it slow?
- Algorithm inefficient? (O(n²) algorithm?)
- Loading too much data?
- Not caching?
- Unnecessary work?

**4. Design Optimization**
- Proposed solution
- Expected improvement
- Trade-offs
- Risk assessment

**5. Implement Optimization**
- Minimal code change
- Doesn't break functionality
- Add tests if possible

**6. Measure Impact**
- Run profiler again
- Compare: before vs after
- Quantify improvement

**7. Validate**
- No regressions
- User-facing improvement
- Document changes

## Output

```markdown
# Performance Optimization: [Component/System]

## Baseline Metrics
- Load time: 3200ms
- CPU: High
- Bundle: 450KB

## Bottleneck Analysis
[Root cause explanation with data]

## Optimization Approach
[Solution description]

## Implementation
[Code changes summary]

## Improved Metrics
- Load time: 1300ms (59% improvement)
- CPU: Low
- Bundle: 450KB (no change)

## Trade-offs
- [Trade-off 1]
- [Trade-off 2]

## Validation
- [ ] Functionality unchanged
- [ ] No regressions
- [ ] Tested on: [devices/browsers]
```

## Success Criteria

- [ ] Baseline metrics recorded
- [ ] Bottleneck identified
- [ ] Optimization measured
- [ ] Improvement quantified (not guessed)
- [ ] No regressions

Used by: performance-engineer role
Next: Code review, merge, monitor in production
