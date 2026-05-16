Removed `package-lock.json` from the repository root (agency-ops-suite).

Reason: Next.js warns about multiple lockfiles and may infer the wrong workspace
root. Removing the root-level lockfile lets Next detect `apps/admin-dashboard`
as the workspace root and avoid the warning. The app-level lockfile remains
at `apps/admin-dashboard/package-lock.json`.

Restore the removed file from Git history if needed.
