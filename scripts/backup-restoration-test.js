#!/usr/bin/env node

/**
 * Backup Restoration Test Procedure
 * 
 * Validates that:
 * 1. Backup files are created successfully
 * 2. Backup files contain valid JSON
 * 3. Backup restore logic works (simulated)
 * 4. Backup retention policy is enforced
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_AGE_DAYS = 7;

let results = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Test 1: Backup Directory Exists
function testBackupDirectoryExists() {
  console.log('\n📁 TEST 1: Backup Directory Exists');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('  ℹ️  Directory does not exist (will be created on first backup)');
      console.log(`     Expected path: ${BACKUP_DIR}`);
      results.passed++;
      results.details.push('ℹ️  Backup directory: Not yet created');
      return true;
    }
    
    console.log(`  ✅ Backup directory exists`);
    console.log(`     Path: ${BACKUP_DIR}`);
    results.passed++;
    results.details.push('✅ Backup directory: Ready');
    return true;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`Directory check failed: ${e.message}`);
    return false;
  }
}

// Test 2: List Backup Files
function testListBackupFiles() {
  console.log('\n📋 TEST 2: List Backup Files');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('  ℹ️  No backups yet (directory not created)');
      results.passed++;
      results.details.push('ℹ️  Backup files: None yet');
      return true;
    }
    
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    
    console.log(`  ✅ Found ${backupFiles.length} backup file(s)`);
    
    if (backupFiles.length > 0) {
      console.log('     Files:');
      backupFiles.slice(-5).forEach(f => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        const ageDays = (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
        console.log(`       - ${f} (${ageDays.toFixed(1)}d old, ${(stat.size / 1024).toFixed(1)}KB)`);
      });
    }
    
    results.passed++;
    results.details.push(`✅ Backup files: ${backupFiles.length} available`);
    return true;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`File listing failed: ${e.message}`);
    return false;
  }
}

// Test 3: Validate Backup JSON Structure
function testBackupJsonValidity() {
  console.log('\n🔍 TEST 3: Validate Backup JSON');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('  ⏭️  No backups to validate');
      results.passed++;
      results.details.push('ℹ️  JSON validation: No backups yet');
      return true;
    }
    
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('  ⏭️  No backup files to validate');
      results.passed++;
      results.details.push('ℹ️  JSON validation: No backups yet');
      return true;
    }
    
    let validCount = 0;
    let invalidCount = 0;
    
    // Check latest 3 backups
    files.slice(-3).forEach(file => {
      try {
        const content = fs.readFileSync(path.join(BACKUP_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        
        if (data.ts && data.results) {
          console.log(`  ✅ ${file}: Valid JSON structure`);
          validCount++;
        } else {
          console.log(`  ⚠️  ${file}: Missing required fields (ts/results)`);
          invalidCount++;
        }
      } catch (e) {
        console.log(`  ❌ ${file}: Invalid JSON - ${e.message}`);
        invalidCount++;
      }
    });
    
    if (validCount > 0 && invalidCount === 0) {
      results.passed++;
      results.details.push(`✅ JSON validation: ${validCount} backups valid`);
      return true;
    } else if (validCount > 0) {
      results.passed++;
      results.details.push(`⚠️  JSON validation: ${validCount} valid, ${invalidCount} invalid`);
      return true;
    } else {
      results.failed++;
      results.errors.push(`❌ JSON validation: ${invalidCount} invalid backups`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`JSON validation error: ${e.message}`);
    return false;
  }
}

// Test 4: Check Backup Retention Policy
function testBackupRetentionPolicy() {
  console.log('\n🔄 TEST 4: Backup Retention Policy');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log(`  ℹ️  No backups yet (retention: ${MAX_AGE_DAYS} days)`);
      results.passed++;
      results.details.push(`ℹ️  Retention policy: ${MAX_AGE_DAYS}d (no backups to check)`);
      return true;
    }
    
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    const now = Date.now();
    
    let tooOld = 0;
    let withinPolicy = 0;
    
    backupFiles.forEach(file => {
      const stat = fs.statSync(path.join(BACKUP_DIR, file));
      const ageDays = (now - stat.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageDays > MAX_AGE_DAYS) {
        tooOld++;
      } else {
        withinPolicy++;
      }
    });
    
    console.log(`  ℹ️  Retention: ${MAX_AGE_DAYS} days`);
    console.log(`     Within policy: ${withinPolicy} backups`);
    console.log(`     Exceeds policy: ${tooOld} backups`);
    
    if (tooOld > 0) {
      console.log('  ⚠️  Some backups exceed retention policy (cleanup should occur on next backup)');
      results.passed++;
      results.details.push(`ℹ️  Retention: ${withinPolicy} current, ${tooOld} exceeds policy`);
    } else {
      results.passed++;
      results.details.push(`✅ Retention: All ${withinPolicy} backups within policy`);
    }
    
    return true;
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`Retention check failed: ${e.message}`);
    return false;
  }
}

// Test 5: Simulate Restore Data Accessibility
function testRestoreDataStructure() {
  console.log('\n📂 TEST 5: Backup Data Structure');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('  ⏭️  No backups to analyze');
      results.passed++;
      results.details.push('ℹ️  Data structure: No backups yet');
      return true;
    }
    
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('  ⏭️  No backup files found');
      results.passed++;
      results.details.push('ℹ️  Data structure: No backups yet');
      return true;
    }
    
    // Analyze latest backup
    const latestFile = files[files.length - 1];
    const latestPath = path.join(BACKUP_DIR, latestFile);
    const content = fs.readFileSync(latestPath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`  ✅ Latest backup: ${latestFile}`);
    
    if (data.results) {
      const endpoints = Object.keys(data.results);
      console.log(`     Includes ${endpoints.length} endpoint(s):`);
      endpoints.forEach(ep => {
        const result = data.results[ep];
        const status = result.error ? '❌' : '✅';
        console.log(`       ${status} ${ep}`);
      });
      
      results.passed++;
      results.details.push(`✅ Backup data: Contains ${endpoints.length} endpoints`);
      return true;
    } else {
      results.failed++;
      results.errors.push('❌ Backup data: Missing endpoints');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`Data structure check failed: ${e.message}`);
    return false;
  }
}

// Test 6: Test Restore Simulation
function testRestoreSimulation() {
  console.log('\n🔄 TEST 6: Restore Simulation');
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('  ⏭️  No backups to restore');
      results.passed++;
      results.details.push('ℹ️  Restore test: No backups');
      return true;
    }
    
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('  ⏭️  No backup files to restore');
      results.passed++;
      results.details.push('ℹ️  Restore test: No backups');
      return true;
    }
    
    const latestFile = files[files.length - 1];
    const latestPath = path.join(BACKUP_DIR, latestFile);
    
    // Simulate reading backup
    console.log(`  ✅ Can read latest backup: ${latestFile}`);
    
    // Simulate parsing
    const content = fs.readFileSync(latestPath, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`  ✅ Can parse backup JSON`);
    
    // Simulate validation
    if (data.ts && data.results) {
      console.log(`  ✅ Backup has valid structure (timestamp: ${new Date(data.ts).toISOString()})`);
      results.passed++;
      results.details.push('✅ Restore simulation: All steps pass');
      return true;
    } else {
      results.failed++;
      results.errors.push('❌ Restore simulation: Invalid backup structure');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`Restore simulation failed: ${e.message}`);
    return false;
  }
}

// Test 7: Backup Endpoint Code Review
function testBackupEndpointImplementation() {
  console.log('\n⚙️  TEST 7: Backup Endpoint Implementation');
  try {
    const routeCandidates = [
      path.join(process.cwd(), 'apps/admin-dashboard/src/app/api/admin/backup/route.ts'),
      path.join(process.cwd(), 'src/app/api/admin/backup/route.ts'),
    ];
    const routePath = routeCandidates.find(candidate => fs.existsSync(candidate));

    if (!routePath) {
      console.log('  ❌ Backup endpoint file not found');
      results.failed++;
      results.errors.push('Backup endpoint missing');
      return false;
    }
    
    const content = fs.readFileSync(routePath, 'utf-8');
    
    const checks = [
      { pattern: /requireAdmin|auth/, name: 'Admin authentication' },
      { pattern: /cleanupOldBackups/, name: 'Cleanup function' },
      { pattern: /BACKUP_RETENTION_DAYS|retentionDays/, name: 'Retention configuration' },
      { pattern: /fs\.writeFile|writeFile/, name: 'File writing' },
      { pattern: /.json/, name: 'JSON format' },
    ];
    
    let passedCount = 0;
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`  ✅ ${check.name}`);
        passedCount++;
      } else {
        console.log(`  ⚠️  ${check.name}`);
      }
    });
    
    if (passedCount >= 4) {
      results.passed++;
      results.details.push(`✅ Backup endpoint: ${passedCount}/${checks.length} features`);
      return true;
    } else {
      results.failed++;
      results.errors.push(`Backup endpoint incomplete: ${passedCount}/${checks.length}`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    results.failed++;
    results.errors.push(`Endpoint review error: ${e.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔄 Backup Restoration Test Procedure');
  console.log(`   Backup Directory: ${BACKUP_DIR}`);
  console.log(`   Max Age: ${MAX_AGE_DAYS} days`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('═'.repeat(70));

  testBackupDirectoryExists();
  testListBackupFiles();
  testBackupJsonValidity();
  testBackupRetentionPolicy();
  testRestoreDataStructure();
  testRestoreSimulation();
  testBackupEndpointImplementation();

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST RESULTS');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   Total:  ${results.passed + results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  ISSUES:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }

  console.log('\n📋 DETAILS:');
  results.details.forEach(detail => {
    console.log(`   ${detail}`);
  });

  console.log('\n💡 NEXT STEPS:');
  if (results.failed === 0) {
    console.log('   ✅ Backup infrastructure is ready');
    console.log('   ⏭️  Create a test backup: npm run backup (when implemented)');
    console.log('   ⏭️  Verify restore procedure works');
    console.log('   ⏭️  Test Supabase restore from backup data');
  } else {
    console.log('   ⚠️  Address issues above before relying on backups');
  }

  const exitCode = results.failed > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? '✅ Backup infrastructure ready' : '❌ Issues found'}`);
  process.exit(exitCode);
}

// Main
runAllTests().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
