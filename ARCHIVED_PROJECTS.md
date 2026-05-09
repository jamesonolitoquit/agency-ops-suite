Archived Projects
=================

These projects are intentionally archived to reduce maintenance and operational noise.
They are not part of the active delivery or CI pipelines.

Archived list (2026-05-10):

- `birthday-website` — showcase / experiment
- `business-website-sample` — sample templates
- `web-application-sample` — experimental app
- `portfolio-website` — portfolio experiments

Notes
-----

- These folders remain as independent repositories in the workspace. They are left intact and not imported into the main monorepo to preserve their separate workflows and remotes.
- Do NOT run CI or workspace build checks against these projects while the team focuses on `agency-ops-suite` and `deployhubph-main`.
- To reinstate a project, move it out of the archive area and re-enable its CI/workflows as needed.

Recommended follow-ups
----------------------

1. Add these paths to any CI workflow `paths` or `paths-ignore` rules so builds skip them.
2. Document deploy/hosting status per archived project when known.
