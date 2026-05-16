# refactor-system.md

Systematic code restructuring without behavior changes.

## Objective

Improve code quality, maintainability, reduce debt without changing functionality.

## Prerequisites

- Target system identified
- Full test coverage present
- system-architect leads refactoring
- No concurrent feature work

## Workflow

**1. Analyze Current State**
- What's the problem? (duplication, complexity, coupling, debt)
- Who's affected?
- Impact of not refactoring?

**2. Design Target State**
- How should it be structured?
- What patterns apply?
- How does it improve things?

**3. Create Migration Plan**
- Phased approach (don't refactor everything at once)
- Identify refactoring order
- Maintain functionality throughout

**4. Implement Phase 1**
- Smallest safe refactoring
- All tests pass
- No behavior changes
- Code review

**5. Test Thoroughly**
- Unit tests pass
- Integration tests pass
- E2E tests pass
- No regressions

**6. Repeat**
- Next phase of migration
- Keep tests green
- Document learnings

**7. Complete**
- All phases done
- Code review approved
- Tests comprehensive
- Performance unaffected

## Output

```markdown
# Refactoring: [System Name]

## Problem
[What's wrong with current code]

## Target
[How should it be structured]

## Benefits
- [Benefit 1]
- [Benefit 2]

## Migration Plan
Phase 1: [description]
Phase 2: [description]
Phase 3: [description]

## Phase 1 Implementation
[Code changes]

## Tests
- All tests pass: yes
- New tests added: [count]
- Coverage: XX%

## Performance Impact
- Bundle size: [no change / +XX% / -XX%]
- Runtime: [no change / faster / slower]

## Migration Status
- Phase 1: ✅ Complete
- Phase 2: ⏳ In progress
- Phase 3: ⏳ Planned
```

## Success Criteria

- [ ] Target state designed
- [ ] Migration plan clear
- [ ] All tests pass after each phase
- [ ] No behavior changes
- [ ] Code cleaner/more maintainable

Used by: system-architect role
Next: Quality review, merge, deploy to main
