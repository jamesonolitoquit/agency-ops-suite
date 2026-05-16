#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function usage() {
  console.log('Usage: node scripts/automated-restore.mjs <backup.sql> [--checks checks.json] [--keep] [--dry-run]');
  console.log('Example: node scripts/automated-restore.mjs backups/backup-2026-05-11.sql --checks scripts/restore-checks.json');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 1) usage();

const BACKUP_FILE = args[0];
const checksIndex = args.indexOf('--checks');
const KEEP = args.includes('--keep');
const DRY_RUN = args.includes('--dry-run');
let CHECKS_FILE = null;
if (checksIndex !== -1) CHECKS_FILE = args[checksIndex + 1];

if (!fs.existsSync(BACKUP_FILE)) {
  console.error('Backup file not found:', BACKUP_FILE);
  process.exit(1);
}

if (CHECKS_FILE && !fs.existsSync(CHECKS_FILE)) {
  console.error('Checks file not found:', CHECKS_FILE);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${res.status}`);
}

function runCapture(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${res.status}: ${res.stderr}`);
  return res.stdout;
}

async function main() {
  if (DRY_RUN) {
    const backupStat = fs.statSync(BACKUP_FILE);
    console.log(`Dry run: backup exists (${backupStat.size} bytes): ${path.resolve(BACKUP_FILE)}`);
    if (CHECKS_FILE) {
      const checks = JSON.parse(fs.readFileSync(CHECKS_FILE, 'utf8'));
      console.log(`Dry run: checks file loaded with ${Object.keys(checks).length} table check(s): ${path.resolve(CHECKS_FILE)}`);
    } else {
      console.log('Dry run: no checks file provided');
    }
    console.log('Dry run complete. Docker/Postgres restore was not executed.');
    return;
  }

  // check docker
  try {
    run('docker', ['--version']);
  } catch (e) {
    console.error('Docker is required but not found in PATH. Install Docker and retry, or use --dry-run to validate inputs only.');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const containerName = `restore-temp-${timestamp}`;
  const pgPort = 5433; // local mapped port

  console.log('Starting ephemeral Postgres container for safe restore...');
  run('docker', ['run', '--name', containerName, '-e', 'POSTGRES_PASSWORD=postgres', '-p', `${pgPort}:5432`, '-d', 'postgres:15']);

  console.log('Waiting for Postgres to accept connections...');
  // wait for readiness
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // use psql inside container to check
      runCapture('docker', ['exec', containerName, 'pg_isready', '-U', 'postgres']);
      console.log('Postgres is ready');
      break;
    } catch (err) {
      if (i === maxAttempts - 1) {
        console.error('Postgres did not become ready in time');
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // copy backup into container
  const absBackup = path.resolve(BACKUP_FILE);
  console.log('Copying backup into container...');
  run('docker', ['cp', absBackup, `${containerName}:/backup.sql`]);

  console.log('Running restore inside container (this runs psql -f /backup.sql)...');
  run('docker', ['exec', '-u', 'postgres', containerName, 'psql', '-U', 'postgres', '-d', 'postgres', '-f', '/backup.sql']);
  console.log('\u2713 Restore complete inside ephemeral DB');

  let checks = null;
  if (CHECKS_FILE) {
    try {
      checks = JSON.parse(fs.readFileSync(CHECKS_FILE, 'utf8'));
    } catch (e) {
      console.error('Failed to parse checks JSON:', e.message);
      throw e;
    }
  }

  if (checks) {
    console.log('Running validation checks...');
    let allPass = true;
    for (const [table, expected] of Object.entries(checks)) {
      // run count
      const sql = `select count(*) from ${table};`;
      try {
        const out = runCapture('docker', ['exec', '-u', 'postgres', containerName, 'psql', '-U', 'postgres', '-d', 'postgres', '-t', '-c', sql]);
        const count = Number(out.trim());
        console.log(`${table}: ${count}${expected !== null && expected !== undefined ? ` (expected ${expected})` : ''}`);
        if (expected !== null && expected !== undefined && count !== Number(expected)) {
          console.error(`✗ Check failed for ${table}: expected ${expected}, got ${count}`);
          allPass = false;
        }
      } catch (e) {
        console.error(`Error querying ${table}:`, e.message);
        allPass = false;
      }
    }
    if (allPass) console.log('\u2713 All validation checks passed');
    else console.error('Some checks failed — investigate before applying to staging');
  } else {
    console.log('No checks file provided; restore and manual inspection completed inside ephemeral DB.');
  }

  if (KEEP) {
    console.log(`Keeping container ${containerName} for inspection. To remove it later: docker rm -f ${containerName}`);
  } else {
    console.log('Tearing down ephemeral container...');
    run('docker', ['rm', '-f', containerName]);
    console.log('\u2713 Ephemeral container removed');
  }

  console.log('Automated restore run completed');
}

main().catch((err) => {
  console.error('Automated restore failed:', err.message || err);
  process.exit(1);
});
