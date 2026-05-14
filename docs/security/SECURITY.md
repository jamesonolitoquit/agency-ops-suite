# Security Policy

This repository treats secrets, backups, and production access as operator-only material.

## Secret Storage

Store all secrets only in managed secret stores:
- Vercel environment variables
- GitHub Actions secrets
- Supabase dashboard secrets
- Password manager or approved team vault

Do not commit secrets to the repository, docs, or issue comments.

## Required Secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTAKE_WEBHOOK_SECRET`
- `JWT_SECRET`
- `ADMIN_EMAIL_ALLOWLIST`
- `ADMIN_ROLE_ALLOWLIST` if role-mapped access is enabled

## Rotation Guidance

Rotate immediately if any secret is exposed or suspected exposed.

1. Revoke or regenerate the affected secret in the source platform.
2. Update the deployment platform secret store.
3. Redeploy the application.
4. Re-run smoke tests.
5. Confirm no secret appears in logs or build output.

## Access Control

- Limit Supabase dashboard access to the smallest possible operator set.
- Limit Vercel production deploy access to authorized maintainers.
- Keep CI/CD credentials separate from application runtime secrets.

## Incident Handling

If you suspect secret exposure:
1. Stop the deployment pipeline if needed.
2. Rotate the secret.
3. Review recent logs and deploys.
4. Document the incident in the production operations runbook.

## Related Docs

- [PRODUCTION_OPERATIONS_RUNBOOK.md](docs/PRODUCTION_OPERATIONS_RUNBOOK.md)
- [TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md)
- [PRODUCTION_READINESS_CHECKLIST.md](docs/PRODUCTION_READINESS_CHECKLIST.md)
