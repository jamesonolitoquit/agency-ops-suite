# Memory — Long-Term Engineering Intelligence

Institutional memory that preserves decisions, mistakes, and lessons learned.

## Files

| File | Purpose | When Updated |
|------|---------|---------------|
| **architectural-decisions.md** | ADRs: decisions made and rationale | When architecture changes |
| **failed-approaches.md** | What we tried that didn't work | When discovering better way |
| **optimization-history.md** | Performance improvements and impact | After optimization completed |
| **known-bugs.md** | Recurring issues and workarounds | When pattern detected |
| **deployment-incidents.md** | Production issues and prevention | After production incident |

## Usage

**Prevent repeating mistakes:**
```
Before: "Should we use Redux or Zustand?"
After: Check architectural-decisions.md
Result: See previous decision + rationale
Action: Use Zustand (already decided)
```

**Learn from past:**
```
Before: Trying client-side validation
After: Check failed-approaches.md
Result: See validation always must be server-side
Action: Build server-side validation first
```

## Updating

**Add decision:**
1. New ADR made
2. Add to architectural-decisions.md
3. Include decision + rationale + status

**Add failed approach:**
1. Discover better way
2. Document what we tried
3. Explain why it failed
4. Document lesson learned

**Add incident:**
1. Production issue resolved
2. Add to deployment-incidents.md
3. Include symptom, root cause, prevention

## Key Principle

**Memory prevents institutional amnesia.**

Don't force the team to make the same mistake twice.
- How: The technique used
- Trade-off: What we gave up (if anything)
- Impact: User/developer experience improvement

### deployment-incidents.md
Production issues and recovery:
- Incident: Brief description
- Time to detect: How long until we noticed
- Time to resolve: How long to fix
- Root cause: Why it happened
- Fix: What we did
- Prevention: How to prevent recurrence
- Post-mortem: Link to full incident review

### feature-history.md
Major features and their evolution:
- Feature: Name
- Initial version: When launched
- Iterations: Major changes/improvements
- Learnings: What we'd do differently
- Deprecated in: If feature was retired

## Memory Usage

```
Before making a decision:
  1. Check architectural-decisions.md
     (Have we decided this already?)
  2. Check failed-approaches.md
     (Did we try this before?)
  3. Check known-bugs.md
     (Is there a workaround?)
     
During implementation:
  4. Reference optimization-history.md
     (How did we solve similar problem?)
  5. Check deployment-incidents.md
     (Any deployment gotchas?)

After decisions/discoveries:
  6. Update relevant memory file
     (Preserve for future agents)
```

## Memory File Format

### ADR (Architectural Decision)

```markdown
# Decision: Zustand for State Management

## Context
- Project: Medium-sized React application
- Team size: 3-5 developers
- Requirements: Global state, optional persistence

## Decision
Use Zustand instead of Redux/MobX

## Rationale
- Minimal boilerplate (vs Redux)
- TypeScript support (vs Context)
- Simple learning curve
- Proven performance
- Smaller bundle size

## Alternatives Considered
1. Redux: Too much boilerplate for project scope
2. Context + useReducer: Coupling issues at scale
3. Jotai: Similar to Zustand, slightly more complex

## Consequences
- POSITIVE: Developers productive quickly
- POSITIVE: Simple to test
- POSITIVE: Small bundle footprint
- NEGATIVE: Fewer ecosystem plugins vs Redux
- NEGATIVE: Smaller community

## Status
✅ Accepted (May 2024)
Last reviewed: May 2024

## Related Decisions
- Decision 3: TypeScript strict mode
- Decision 7: Component colocation
```

### Failed Approach

```markdown
# Failed Approach: Client-Side Form Validation Only

## Context
Trying to keep validation close to form component.

## What We Tried
- Form component validates all inputs
- No server-side validation initially
- Planned to add server validation "later"

## What Happened
- Edge cases from API bypassed form validation
- Data inconsistencies in database
- Confusion about source of truth
- Complex bug reproduction

## Why It Failed
- Validation is business logic, not UI logic
- Client-side validation is UX only, never security
- Validation must live on server

## Lesson Learned
- **Always validate server-side**
- Client-side validation is UX enhancement only
- Define validation once, use everywhere

## Prevention
- Code review catches client-only validation
- Architecture standards require server validation
- Tests catch validation gaps

## What To Do Instead
```typescript
// Client: For UX
if (!email.includes('@')) {
  showError('Invalid email');
}

// Server: For truth
const schema = z.object({
  email: z.string().email(),
});
const result = schema.parse(data); // Throws if invalid
```
```

### Known Bug

```markdown
# Known Bug: Dark Mode Tailwind Classes Not Applied on First Load

## Symptom
- Page loads in dark mode
- Tailwind dark: classes not visible
- Force re-render and they appear

## Root Cause
- CSS-in-JS initialization race condition
- Tailwind not fully loaded when React hydrates
- Affects ~2% of users

## Workaround
Add to globals.css:
```css
html {
  transition: background-color 0.3s;
}
```

## Why It Happens
- Server renders with dark mode
- Browser hydrates before CSS complete
- Flash of unstyled content (FOUC)

## Fix Status
- In backlog for proper solution
- May require Tailwind v4 upgrade
- Low priority (visual issue only)

## Prevention
- Not in critical path
- Monitor for increased reports
```

## Guidelines

- **Keep it Honest** — Include mistakes and lessons learned
- **Make it Searchable** — Use clear titles and tags
- **Reference Externals** — Link to full incident reports, GitHub issues
- **Update Regularly** — Add entries as you discover things
- **Keep it Relevant** — Archive old entries, don't let it become a historical archive

Memory is your institutional AI backbone.
