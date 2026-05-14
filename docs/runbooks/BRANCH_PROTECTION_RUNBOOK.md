# Branch Protection Runbook

Use the GitHub workflow `.github/workflows/apply-branch-protection.yml` to apply branch protection on `main`.

Recommended protection settings:

- Branch pattern: `main`
- Require pull request reviews: 1 approval
- Dismiss stale approvals when new commits are pushed: yes
- Enforce branch protection for admins: yes
- Require status checks to pass before merging: yes
- Required status checks: `CI - Scanners`

Notes:

- `CI - Scanners` is the enforced CI gate for PRs and pushes.
- `Protected E2E - Staging` is a manual workflow that requires protected secrets; it is not a required branch check.
- `Manual - Restore Validation` is for operator validation and should remain manual.

How to apply:

1. Open GitHub Actions.
3. Run `Apply Branch Protection`.
4. Keep the default branch list unless you need to protect additional release branches.
5. Require these checks: `CI - Scanners` and `E2E - Protected Staging` (adjust if your E2E job name differs).
6. Restrict who can push to `main` to prevent direct pushes. Recommended actors:
	- a single operator GitHub user (admin/operator account)
	- the GitHub Actions app (if automation needs to push)

	The workflow `apply-branch-protection.yml` accepts `allowed_users`, `allowed_teams`, and `allowed_apps`.

Notes:
- To fully block direct pushes, configure `restrictions` on the branch protection to list allowed users/teams/apps. This prevents anyone else (including repo admins) from pushing directly.
- When using `allowed_apps`, ensure the app slug is correct and that the app is installed on the repository.

If GitHub rejects the update, verify:

- You are a repo admin.
- The workflow has `GITHUB_TOKEN` access to branch protection.
- The branch already has a commit history and is not protected by an org-level policy that overrides repository rules.
