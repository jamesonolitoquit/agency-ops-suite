# Vercel Runbook

Purpose: document the exact steps used to link, configure, and deploy the
`agency-ops-suite` project to Vercel (production and preview), and how to
reproduce these steps locally or in CI.

Quick commands

- Link local repo to Vercel project (one-time):

```bash
npx vercel link --yes --team <your-team> --project agency-ops-suite
```

- Add project environment variables (example):

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://<project>.supabase.co"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --value "<anon-key>"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --value "<service-role-key>"
npx vercel env add NEXT_PUBLIC_USE_SEED_DATA production --value "false"
```

Repeat for `preview` if you want preview envs.

- Create a deploy hook (optional) in the Vercel UI and trigger it via an
  HTTP POST to the hook URL to start a deployment from external systems.

- Trigger a manual deploy from CLI (preview):

```bash
npx vercel deploy --yes
```

- Trigger a manual deploy to production:

```bash
npx vercel deploy --prod --yes
```

Notes and gotchas
- Avoid using `@secret` references in `vercel.json` unless you've created
  the corresponding Vercel Secret via the Vercel UI / API. We used project
  environment variables instead to avoid missing-secret failures.
- If Next.js warns about workspace root detection, ensure the app's own
  `package-lock.json` (or `pnpm-lock.yaml`) exists and the app directory is
  correctly targeted. See `apps/admin-dashboard/next.config.mjs` for
  app-specific configuration.
- CI: set `VERCEL_TOKEN` as a repository secret in GitHub before enabling the
  GitHub Actions workflow (the workflow uses the token to run `npx vercel`).

Where to look
- Vercel project: https://vercel.com/jamesonolitoquits-projects/agency-ops-suite
- Local app entry: `apps/admin-dashboard`
