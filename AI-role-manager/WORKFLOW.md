# AI Role Manager — Workflow and Organization

Purpose: clarify which role files are canonical, where to write plans, and how to route tasks.

Guidelines:
- Keep one canonical file per role under `AI-role-manager/roles/` (do not duplicate prompts across files).
- Use `AI-role-manager/README.md` for onboarding and role index.
- Use `AI-role-manager/role-registry.json` for programmatic role lookup; update it when adding roles.

Suggested file organization:
- `AI-role-manager/README.md` — overview and quick-start.
- `AI-role-manager/role-registry.json` — canonical registry.
- `AI-role-manager/router.md` — routing rules for ambiguous tasks.
- `AI-role-manager/roles/*.md` — role-specific instructions (Architect, Engineer, QA Specialist, etc.).

Rewrite policy:
- When updating instructions, include `lastUpdated` date and short changelog at top.
