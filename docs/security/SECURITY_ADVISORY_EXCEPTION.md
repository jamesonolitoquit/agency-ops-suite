# Security Advisory Exception Log

## Active Exception

- **Package:** `next` transitive `postcss`
- **Advisory:** GHSA-qx2v-qp2m-jg93
- **Severity:** Moderate
- **Scope:** `apps/admin-dashboard`
- **Status:** Temporarily accepted

## Why this exception exists

The admin dashboard has been migrated to Next 16.2.4 and passes build, smoke, and E2E validation. The remaining audit finding is a transitive PostCSS advisory bundled through the current Next.js release line. There is no newer patched Next.js version available from the registry at this time, so this is being tracked as a documented, temporary exception instead of blocking delivery.

## Current controls

- High-severity audit issues are blocking in CI.
- Production build passes on Next 16.2.4.
- Smoke tests and E2E validation pass after the migration.
- Next/image optimization is disabled in the dashboard to reduce attack surface.
- Baseline security headers are enabled in the app config.

## Review date

- **Next review:** 2026-05-07

## Exit criteria

Remove this exception when one of the following is true:

1. Next.js ships a patched release that resolves the transitive PostCSS advisory.
2. The dependency tree can be updated so `npm audit --omit=dev` returns clean for the dashboard workspace.
3. A security decision is made to accept the remaining moderate advisory permanently with explicit sign-off.
