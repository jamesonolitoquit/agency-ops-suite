# Security Audit — Quick Findings

Summary: quick scan for obvious issues and recommended fixes.

Findings
- Tracked secrets: `apps/admin-dashboard/.env.local` contained Supabase anon and service-role keys — these have been sanitized and replaced with placeholders. Move secrets to the hosting/CI secret manager.
- Docs contained an inline service-role key placeholder — replaced with `<your-service-role-key>`.
- `.env*.local` is now in `.gitignore` at repo and app level, but if secrets were committed previously they remain in git history; rotate those keys.
- Vercel-specific environment fields were present in tracked `.env.local` — removed to avoid leaking build metadata.
- Some scripts and docs reference smoke/staging env var names (`SMOKE_SUPABASE_SERVICE_ROLE_KEY`, `STAGING_SUPABASE_SERVICE_ROLE_KEY`) — ensure these are only set in CI or CI envs and not in committed files.

Immediate actions taken
- Sanitized `apps/admin-dashboard/.env.local` (secrets cleared).
- Replaced inline secret in `docs/REFERENCE_API_DOCUMENTATION.md` with placeholder.

Recommendations
1. Rotate the Supabase service role key immediately (if it was ever committed or present in repo history).
2. Store `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as protected secrets in your deployment platform (Vercel/GitHub Actions/Azure Key Vault) and reference them as environment vars at deploy time.
3. Add a short `SECURITY.md` (this file) to the repo root describing where secrets live and who can rotate them.
4. Configure CI to run `npm run test:smoke` and Playwright tests on PRs; block merges on failures.
5. Enable database backups and configure monitoring/alerting for failed auth or audit insert errors.

If you want, I can prepare a PR that removes any tracked `.env.local` from git history (bfg/git-filter-repo) and post-rotate instructions — tell me if you'd like me to proceed.
