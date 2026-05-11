# AI Role Manager

> **Purpose:** Tailored role system for improving your portfolio website and creating sample website projects that strengthen your portfolio proof.

## How to Use

1. Open a new Copilot chat for a specific task.
2. Paste or attach one role file from `roles/`.
3. Ask the task with clear acceptance criteria.
4. If unsure which role fits, load `router.md` first.

### Recommended Workflow for Sample Website Initiatives

1. Architect: define concept shortlist, target audience, and MVP scope.
2. Content Strategist: create positioning, project story, and CTA copy.
3. Engineer: implement the MVP and integrate showcase sections.
4. QA Specialist: validate release quality and portfolio publish readiness.

### File Organization Notes

- Use `Content Strategist` in prose and `content-strategist` in the registry key.
- Keep one canonical file per role; do not create parallel role prompts for the same purpose.
- Route ambiguous work through `router.md` before starting implementation or QA.

## Role Index

| Role | File | When to Use |
|---|---|---|
| **AI Router** | `router.md` | Classify requests and split multi-step work |
| **Architect** | `roles/architect.md` | Information architecture, UX strategy, component boundaries, roadmap |
| **Engineer** | `roles/engineer.md` | Build features, refactor code, debug runtime/build issues |
| **QA Specialist** | `roles/qa-specialist.md` | Code review, accessibility checks, performance checks, release readiness |
| **Content Strategist** | `roles/world-author.md` | Portfolio copy, project storytelling, case studies, SEO-ready content |

## Rules

- One role per chat thread.
- Use router first when task scope is ambiguous.
- Keep responses aligned to portfolio goals: clarity, conversion, credibility, performance, and visible proof of capability.
- Prefer small, testable increments over broad rewrites.

## Target Project Context

- Project: `portfolio-website`
- Stack: Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS, Framer Motion
- Standard checks: `npm run lint` and `npm run build`
