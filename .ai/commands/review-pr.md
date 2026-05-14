# review-pr.md

Senior engineer code review with risk assessment.

## Objective

Evaluate pull request like a senior engineer would.

## Prerequisites

- PR diff available
- Project standards loaded
- Code context available

## Workflow

**1. Scan Changes**
- What files changed?
- How many lines?
- Change magnitude assessment

**2. Architecture Review**
- Boundary violations?
- Tight coupling?
- Circular dependencies?
- API contracts respected?

**3. Security Check**
- Input validation?
- Auth guards present?
- Secrets exposed?
- XSS/injection risks?
- Rate limiting?

**4. Performance Review**
- Unnecessary rerenders (React)?
- Missing memoization?
- N+1 queries (SQL)?
- Bundle size impact?

**5. Code Quality**
- Tests present and adequate?
- Error handling?
- Type safety?
- Naming clear?
- Duplicated logic?

**6. Score and Recommend**
- Risk level: Critical/High/Medium/Low
- Quality score: 1-10
- Actionable feedback
- Approval recommendation

## Output

```markdown
# PR Review: [PR Title]

## Summary
[1-2 sentence overview of changes]

## Risk Assessment
- Risk level: [CRITICAL|HIGH|MEDIUM|LOW]
- Key concerns: [list]

## Architecture
- [Finding 1 with recommendation]
- [Finding 2 with recommendation]

## Security
- [Finding 1 with fix suggestion]
- [Finding 2 with fix suggestion]

## Performance
- [Finding 1]
- [Finding 2]

## Code Quality
- [Finding 1]
- [Finding 2]

## Test Coverage
- Coverage: XX%
- Critical paths tested? [yes/no]

## Quality Score
8/10

## Recommendation
[APPROVE|REQUEST CHANGES|NEEDS DISCUSSION]

## Specific Changes Requested
1. [Change 1 with line reference]
2. [Change 2 with line reference]
```

## Success Criteria

- [ ] All files reviewed
- [ ] Risk identified
- [ ] Actionable feedback
- [ ] Clear approval recommendation
- [ ] No vague comments

Used by: Review phase in workflows
Next: Author addresses comments or merges
