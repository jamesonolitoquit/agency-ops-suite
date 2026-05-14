import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const secretPatterns = [
  { name: 'Stripe secret key', pattern: /sk_(?:live|test)_[A-Za-z0-9]{16,}/g },
  { name: 'Stripe publishable key', pattern: /pk_(?:live|test)_[A-Za-z0-9]{16,}/g },
  { name: 'Stripe webhook secret', pattern: /whsec_[A-Za-z0-9]{16,}/g },
  { name: 'Resend API key', pattern: /re_[A-Za-z0-9]{16,}/g },
  { name: 'JWT-like token', pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g },
  { name: 'Private key block', pattern: /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/g },
];

const trackedEnvFiles = trackedFiles.filter((file) => {
  if (!/(^|\/|\\)\.env(\.|$)/.test(file)) {
    return false;
  }

  return !/\.env(?:\.[^/\\]+)?\.(?:example|sample|template)$/i.test(file);
});
const findings = [];

for (const file of trackedFiles) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      findings.push(`${file}: ${name}`);
    }
  }
}

for (const file of trackedEnvFiles) {
  findings.push(`${file}: tracked environment file`);
}

if (findings.length > 0) {
  console.error('Secret scan failed. Remove the following tracked secrets or env files:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed across ${trackedFiles.length} tracked files.`);
