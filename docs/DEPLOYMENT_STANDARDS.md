# Production Deployment Standards

Essential practices before deploying client sites to production.

- Production environment separation: use distinct Supabase and Vercel projects (no shared creds between staging and prod).
- Environment variables: store in secret manager; rotate on personnel changes.
- Backups: daily DB backups, weekly full-site snapshots, test restores monthly.
- SSL: Always enable automatic SSL and monitor expiry (60/30/7 day alerts).
- Uptime monitoring: configure an uptime monitor (Pingdom/UptimeRobot) and page/Slack alerts for outages.
- Error alerting: connect server errors to Sentry or monitoring; set thresholds for paging.
- DNS & Registrar: maintain a secure registrar account under client-owned or agency escrow per contract.
- Rollback plan: keep last stable build and provide immediate rollback procedure.
- Deployment testing: run smoke tests post-deploy that verify home page, contact forms, and key APIs.

Staging Runbook (short):
1. Provision staging project with staging env vars.
2. Deploy branch -> run automated smoke tests.
3. QA pass -> schedule production deployment.

Production Runbook (short):
1. Confirm final approval and payment.
2. Add production env vars and secrets.
3. Deploy -> run smoke tests -> monitor logs for 30 minutes.
4. Enable DNS cutover and SSL.
