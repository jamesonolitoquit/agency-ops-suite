import { execFileSync } from 'node:child_process';
import path from 'node:path';

const PROBLEM_PATTERNS = [
  { test: (relativePath) => /^test-.*\.js$/i.test(path.basename(relativePath)), label: 'legacy top-level test script' },
  { test: (relativePath) => /(^|\/)dev(-server)?\.log$/i.test(relativePath), label: 'debug log' },
  { test: (relativePath) => /(^|\/)logs\//i.test(relativePath), label: 'logs directory' },
  { test: (relativePath) => /(^|\/)backups\//i.test(relativePath), label: 'backups directory' },
  { test: (relativePath) => /(^|\/)test-results\//i.test(relativePath), label: 'test-results directory' },
  { test: (relativePath) => /(^|\/)tests\/payment-reconciliation\.test\.mjs$/i.test(relativePath), label: 'obsolete payment reconciliation wrapper' },
];

const gitStatus = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
}).trim();

const findings = [];

for (const line of gitStatus.split(/\r?\n/)) {
  if (!line.startsWith('?? ')) {
    continue;
  }

  const relativePath = line.slice(3).replace(/\\/g, '/');

  for (const pattern of PROBLEM_PATTERNS) {
    if (pattern.test(relativePath)) {
      findings.push(`${relativePath} (${pattern.label})`);
      break;
    }
  }
}

if (findings.length > 0) {
  console.error('Workspace hygiene issues found:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exitCode = 1;
} else {
  console.log('Workspace hygiene check passed.');
}