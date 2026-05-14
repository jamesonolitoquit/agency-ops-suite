Apply branch protection helper

This repository includes a small Node script to apply branch protection rules via the GitHub REST API.

Prerequisites
- Node.js 18+ (for global `fetch` support) or set `NODE_OPTIONS=--experimental-fetch` for older Node if needed
- A GitHub token with `repo` or `repo:admin` permissions (do not commit this token)

Usage

Run from the repository root:

```bash
# using env var (recommended)
export GITHUB_TOKEN="ghp_..."
node scripts/apply-branch-protection.mjs --repo owner/repo --branches main,staging --contexts "CI - Scanners,Other Check"

# or pass token explicitly (less secure)
node scripts/apply-branch-protection.mjs --token ghp_... --repo owner/repo
```

Options
- `--repo owner/repo` (or set `GITHUB_REPOSITORY` env var)
- `--branches` comma-separated branches (default: `main`)
- `--contexts` comma-separated required status check contexts (default: `CI - Scanners`)
- `--token` personal access token (or set `GITHUB_TOKEN` env var)

Notes
- The script sets `required_status_checks.strict = true`, enforces admins, and requires 1 approving review.
- If you prefer using the GitHub CLI, you can run the included workflow `.github/workflows/apply-branch-protection.yml` via `gh workflow run --repo owner/repo apply-branch-protection.yml --ref main` (requires `gh` installed and auth).
