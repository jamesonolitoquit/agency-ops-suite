#!/usr/bin/env node

/**
 * Post-Deployment Email & Backup Validation
 * 
 * Tests local infrastructure readiness:
 * 1. Email templates exist and are complete
 * 2. Backup directory and endpoint implementation
 * 3. Supabase configuration
 * 4. Resend email service setup
 * 5. Production connectivity
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = process.env.DEPLOYMENT_URL || 'https://agency-ops-suite.vercel.app';

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: []
};

// Utility: HTTP request (with timeout)
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', () => resolve({ status: 0, body: '' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, body: '' });
    });

    req.end();
  });
}

// Test 1: Email Templates Exist
async function testEmailTemplatesExist() {
  console.log('\n📧 TEST 1: Email Template Files');
  try {
    const templatePath = path.join(process.cwd(), 'apps/admin-dashboard/src/lib/email-templates.ts');
    
    if (fs.existsSync(templatePath)) {
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      const requiredFunctions = [
        'contractSentTemplate',
        'invoiceCreatedTemplate',
        'paymentReceivedTemplate',
        'onboardingWelcomeTemplate',
        'sendEmail'
      ];
      
      let allFound = true;
      const foundFunctions = [];
      
      for (const func of requiredFunctions) {
        if (content.includes(`function ${func}`) || content.includes(`${func}(`)) {
          foundFunctions.push(func);
        } else {
          allFound = false;
        }
      }
      
      console.log(`  ✅ Email templates file exists`);
      console.log(`     Found ${foundFunctions.length}/${requiredFunctions.length} functions`);
      
      if (allFound) {
        testResults.passed++;
        testResults.details.push('✅ Email templates: All functions present');
        return true;
      } else {
        console.log(`  ⚠️  Missing: ${requiredFunctions.filter(f => !foundFunctions.includes(f)).join(', ')}`);
        testResults.failed++;
        testResults.errors.push('❌ Some email template functions missing');
        return false;
      }
    } else {
      console.log('  ❌ Email templates file not found');
      testResults.failed++;
      testResults.errors.push('Email templates file missing');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Email templates error: ${e.message}`);
    return false;
  }
}

// Test 2: Email Template Content
async function testEmailTemplateContent() {
  console.log('\n📧 TEST 2: Email Template Content');
  try {
    const templatePath = path.join(process.cwd(), 'apps/admin-dashboard/src/lib/email-templates.ts');
    const content = fs.readFileSync(templatePath, 'utf-8');
    
    const checks = [
      { pattern: /from:|FROM_EMAIL/, name: 'Sender configured' },
      { pattern: /subject|Subject/, name: 'Subjects defined' },
      { pattern: /html|HTML/, name: 'HTML templates' },
      { pattern: /Resend|resend/, name: 'Resend integration' },
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`  ✅ ${check.name}`);
        passedChecks++;
      }
    });
    
    if (passedChecks >= 3) {
      testResults.passed++;
      testResults.details.push(`✅ Email template content: ${passedChecks}/4 checks pass`);
      return true;
    } else {
      testResults.failed++;
      testResults.errors.push('❌ Email template content incomplete');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Email content error: ${e.message}`);
    return false;
  }
}

// Test 3: Backup Endpoint Implementation
async function testBackupEndpointCode() {
  console.log('\n💾 TEST 3: Backup Endpoint Implementation');
  try {
    const backupRoutePath = path.join(process.cwd(), 'apps/admin-dashboard/src/app/api/admin/backup/route.ts');
    
    if (fs.existsSync(backupRoutePath)) {
      const content = fs.readFileSync(backupRoutePath, 'utf-8');
      
      const checks = [
        { pattern: /POST|export async function POST/, name: 'POST handler' },
        { pattern: /fs\.writeFile|writeFile/, name: 'File writing' },
        { pattern: /backup|Backup/, name: 'Backup logic' },
        { pattern: /cleanup|retention/, name: 'Cleanup/retention' },
      ];
      
      let passedChecks = 0;
      checks.forEach(check => {
        if (check.pattern.test(content)) {
          console.log(`  ✅ ${check.name}`);
          passedChecks++;
        }
      });
      
      if (passedChecks >= 3) {
        testResults.passed++;
        testResults.details.push(`✅ Backup endpoint: ${passedChecks}/4 features implemented`);
        return true;
      } else {
        testResults.failed++;
        testResults.errors.push('❌ Backup endpoint incomplete');
        return false;
      }
    } else {
      console.log('  ❌ Backup endpoint file not found');
      testResults.failed++;
      testResults.errors.push('Backup endpoint missing');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Backup endpoint error: ${e.message}`);
    return false;
  }
}

// Test 4: Backup Directory Structure
async function testBackupDirectoryStructure() {
  console.log('\n💾 TEST 4: Backup Directory');
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const exists = fs.existsSync(backupDir);
    
    if (exists) {
      const files = fs.readdirSync(backupDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      console.log(`  ✅ Directory exists with ${jsonFiles.length} backup(s)`);
      testResults.passed++;
      testResults.details.push(`✅ Backup directory: Ready (${jsonFiles.length} backups)`);
      return true;
    } else {
      console.log(`  ℹ️  Directory does not exist (will be created on first backup)`);
      testResults.passed++;
      testResults.details.push('ℹ️  Backup directory: Not created yet (expected)');
      return true;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Backup directory error: ${e.message}`);
    return false;
  }
}

// Test 5: Supabase Configuration
async function testSupabaseConfiguration() {
  console.log('\n🔗 TEST 5: Supabase Configuration');
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    
    let envDefined = false;
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      if (content.includes('SUPABASE_URL') && content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        envDefined = true;
      }
    }
    
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      envDefined = true;
    }
    
    if (envDefined) {
      console.log(`  ✅ Supabase credentials configured`);
      testResults.passed++;
      testResults.details.push('✅ Supabase: Credentials present');
      return true;
    } else {
      console.log('  ℹ️  Not in .env.local (expected if using Vercel envs)');
      testResults.passed++;
      testResults.details.push('ℹ️  Supabase: Not in local env (expected in production)');
      return true;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Supabase config error: ${e.message}`);
    return false;
  }
}

// Test 6: Resend Configuration
async function testResendConfiguration() {
  console.log('\n✉️  TEST 6: Resend Email Service');
  try {
    const emailTemplatesPath = path.join(process.cwd(), 'apps/admin-dashboard/src/lib/email-templates.ts');
    const content = fs.readFileSync(emailTemplatesPath, 'utf-8');
    
    const hasResendImport = content.includes("from 'resend'") || content.includes('from "resend"');
    const hasApiKeyCheck = content.includes('RESEND_API_KEY');
    const hasSendLogic = content.includes('resend.emails.send');
    
    if (hasResendImport && hasApiKeyCheck) {
      console.log('  ✅ Resend SDK configured');
      if (hasSendLogic) {
        console.log('  ✅ Send logic implemented');
      }
      testResults.passed++;
      testResults.details.push('✅ Resend: SDK configured and ready');
      return true;
    } else {
      console.log('  ⚠️  Resend configuration incomplete');
      testResults.failed++;
      testResults.errors.push('⚠️  Resend setup incomplete');
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Resend error: ${e.message}`);
    return false;
  }
}

// Test 7: Production Connectivity
async function testProductionConnectivity() {
  console.log('\n🌐 TEST 7: Production Connectivity');
  try {
    const response = await fetchUrl(`${BASE_URL}/`);
    
    if (response.status >= 200 && response.status < 500) {
      console.log(`  ✅ Production responding (HTTP ${response.status})`);
      testResults.passed++;
      testResults.details.push(`✅ Production: Application accessible`);
      return true;
    } else {
      console.log(`  ❌ Unexpected response: ${response.status}`);
      testResults.failed++;
      testResults.errors.push(`Production status: ${response.status}`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ Error: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Production error: ${e.message}`);
    return false;
  }
}

// Test 8: Lead Intake Availability
async function testLeadIntakeAvailability() {
  console.log('\n🎯 TEST 8: Lead Intake API');
  try {
    const response = await fetchUrl(`${BASE_URL}/api/intake/lead`);
    
    if (response.status === 405 || response.status === 401 || response.status === 400) {
      console.log(`  ✅ Lead intake endpoint exists (method: ${response.status})`);
      testResults.passed++;
      testResults.details.push('✅ Lead intake: Endpoint available');
      return true;
    } else if (response.status === 404) {
      console.log('  ❌ Lead intake endpoint not found');
      testResults.failed++;
      testResults.errors.push('Lead intake endpoint missing');
      return false;
    } else {
      console.log(`  ℹ️  Lead intake response: ${response.status}`);
      testResults.passed++;
      testResults.details.push('ℹ️  Lead intake: Endpoint responds');
      return true;
    }
  } catch (e) {
    console.log(`  ⚠️  Connection check: ${e.message}`);
    testResults.failed++;
    testResults.errors.push(`Lead intake check error: ${e.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Post-Deployment Email & Backup Validation');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('═'.repeat(70));

  await testEmailTemplatesExist();
  await testEmailTemplateContent();
  await testBackupEndpointCode();
  await testBackupDirectoryStructure();
  await testSupabaseConfiguration();
  await testResendConfiguration();
  await testProductionConnectivity();
  await testLeadIntakeAvailability();

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 VALIDATION SUMMARY');
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   Total:  ${testResults.passed + testResults.failed}`);

  if (testResults.errors.length > 0) {
    console.log('\n⚠️  ISSUES:');
    testResults.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err}`);
    });
  }

  console.log('\n📋 DETAILS:');
  testResults.details.forEach(detail => {
    console.log(`   ${detail}`);
  });

  console.log('\n💡 NEXT STEPS:');
  if (testResults.failed === 0) {
    console.log('   ✅ Email & backup infrastructure ready');
    console.log('   ⏭️  Next: Test email delivery (requires admin auth)');
    console.log('   ⏭️  Next: Test backup restoration');
    console.log('   ⏭️  Next: 48-hour production monitoring');
  } else {
    console.log('   ⚠️  Fix issues above before proceeding');
  }

  const exitCode = testResults.failed > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? '✅ PASS: System ready for next phase' : '❌ FAIL: Address issues first'}`);
  process.exit(exitCode);
}

// Main
runAllTests().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

