# architectural-decisions.md

Architecture Decision Records (ADRs) — decisions made and why.

## Format

Each decision includes:
- **Title:** Brief decision name
- **Date:** When decided
- **Context:** Why this decision was needed
- **Decision:** What we chose
- **Rationale:** Why this option vs alternatives
- **Status:** Accepted / Superseded
- **Consequences:** Trade-offs

## Decisions

### 1: State Management with Zustand

**Date:** [Date]
**Context:** Needed global state management for auth and user data

**Decision:** Use Zustand instead of Redux/Context API

**Rationale:**
- Minimal boilerplate (vs Redux)
- Good TypeScript support
- Simple to test
- Smaller bundle

**Alternatives considered:**
- Redux: Too much boilerplate for our scope
- Context API: Not great for complex state
- Jotai: Similar, slightly more complex

**Status:** ✅ Accepted

**Consequences:**
- Smaller bundle size
- Faster developer iteration
- Less ecosystem plugins than Redux

---

### 2: Server-Side Rendering with Next.js

**Date:** [Date]
**Context:** Needed SSR for SEO and performance

**Decision:** Use Next.js with server components

**Status:** ✅ Accepted

---

### 3: [Future decision]

---

**New decisions go here. Update when architecture changes.**
