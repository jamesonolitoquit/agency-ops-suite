#!/usr/bin/env node
import { argv, env } from 'node:process';

function parseArgs() {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : 'true';
      args[key] = val;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const token = env.GITHUB_TOKEN || args.token;
  if (!token) {
    console.error('GITHUB_TOKEN or --token is required (use a personal access token with repo admin scope)');
    process.exit(1);
  }

  const repoArg = args.repo || env.GITHUB_REPOSITORY;
  if (!repoArg) {
    console.error('Repository must be provided via --repo owner/repo or GITHUB_REPOSITORY env var');
    process.exit(1);
  }
  const [owner, repo] = repoArg.split('/');
  const branches = (args.branches || 'main').split(',').map(s => s.trim()).filter(Boolean);
  const contexts = (args.contexts || 'CI - Scanners').split(',').map(s => s.trim()).filter(Boolean);
  const allowedUsers = (args['allowed-users'] || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowedTeams = (args['allowed-teams'] || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowedApps = (args['allowed-apps'] || '').split(',').map(s => s.trim()).filter(Boolean);

  for (const branch of branches) {
    console.log(`Applying branch protection for ${owner}/${repo}@${branch} ...`);
    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection`;
    const body = {
      required_status_checks: {
        strict: true,
        contexts,
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        required_approving_review_count: 1,
      },
      restrictions: null,
    };

    if (allowedUsers.length || allowedTeams.length || allowedApps.length) {
      body.restrictions = {
        users: allowedUsers,
        teams: allowedTeams,
        apps: allowedApps,
      };
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'authorization': `token ${token}`,
        'accept': 'application/vnd.github+json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      console.log(`✓ Protection applied for ${branch}`);
    } else {
      const txt = await res.text();
      console.error(`✗ Failed to apply protection for ${branch}: ${res.status} ${res.statusText}`);
      console.error(txt);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => { console.error('Error:', err); process.exit(1); });
