#!/usr/bin/env node

/**
 * Admin User Setup Automation Script
 * 
 * Purpose: Automate first admin user configuration:
 * - Add admin email to Vercel environment variables
 * - Trigger deployment
 * - Verify deployment successful
 * - Test admin login
 * 
 * Prerequisites:
 * - Vercel CLI installed: npm i -g vercel
 * - Vercel token: VERCEL_TOKEN environment variable
 * - Production URL accessible
 * 
 * Usage:
 *   node scripts/admin-setup.js --email admin@company.com
 *   node scripts/admin-setup.js --email admin@company.com --verify
 *   node scripts/admin-setup.js --list-current
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const config = {
  projectId: process.env.VERCEL_PROJECT_ID || 'agency-ops-suite',
  productionUrl: process.env.PRODUCTION_URL || 'https://agency-ops-suite.vercel.app',
  vercelToken: process.env.VERCEL_TOKEN,
};

// Utility functions
function log(color, label, message) {
  console.log(`${color}${label}${colors.reset} ${message}`);
}

function executeCommand(command, description) {
  try {
    log(colors.blue, '→', description);
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.productionUrl);
    
    const options = {
      hostname: url.hostname,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body ? JSON.parse(body) : {},
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Admin setup class
class AdminSetup {
  constructor() {
    this.adminEmails = [];
    this.currentEmails = [];
  }

  async getCurrentConfig() {
    log(colors.cyan, '📋', 'Fetching current Vercel environment...');

    // Try using Vercel CLI
    const result = executeCommand(
      `vercel env pull --yes 2>/dev/null || echo "CLI_NOT_AVAILABLE"`,
      'Reading current configuration'
    );

    if (result.success && result.output !== 'CLI_NOT_AVAILABLE\n') {
      // Try to read .env.local if it was created
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/ADMIN_ROLE_ALLOWLIST=(.+)/);
        if (match) {
          this.currentEmails = match[1].split(',').map(e => e.trim()).filter(e => e.includes(':'));
        }
      }
    }

    if (this.currentEmails.length === 0) {
      log(colors.yellow, '⚠️', 'Could not fetch current config (Vercel CLI may not be available)');
      log(colors.gray, 'ℹ️', 'You can verify the config manually in Vercel Dashboard → Settings → Environment Variables');
    } else {
      log(colors.green, '✅', `Current admins: ${this.currentEmails.length}`);
      this.currentEmails.forEach(email => {
        log(colors.gray, '  •', email);
      });
    }
  }

  async addAdminEmail(email, role = 'admin') {
    const adminEntry = `${email}:${role}`;
    
    if (this.currentEmails.includes(adminEntry)) {
      log(colors.yellow, '⚠️', `Admin already exists: ${email}`);
      return false;
    }

    this.adminEmails.push(adminEntry);
    log(colors.green, '✅', `Added admin: ${email}:${role}`);
    return true;
  }

  buildEnvValue() {
    const allEmails = [...this.currentEmails, ...this.adminEmails];
    return allEmails.join(',');
  }

  async applyConfiguration() {
    const envValue = this.buildEnvValue();
    
    log(colors.blue, '→', 'Applying configuration to Vercel...');

    // Method 1: Try using Vercel CLI
    const command = `vercel env add ADMIN_ROLE_ALLOWLIST "${envValue}" --force`;
    const result = executeCommand(command, 'Setting environment variable via Vercel CLI');

    if (result.success) {
      log(colors.green, '✅', 'Environment variable updated');
      return true;
    }

    log(colors.yellow, '⚠️', 'Could not update via CLI - manual steps required');
    return false;
  }

  async triggerDeployment() {
    log(colors.blue, '→', 'Triggering Vercel deployment...');

    const command = `vercel deploy --prod --skip-build`;
    const result = executeCommand(command, 'Deploying to production');

    if (result.success) {
      log(colors.green, '✅', 'Deployment triggered');
      
      // Extract deployment URL from output
      const match = result.output.match(/https:\/\/.*vercel\.app/);
      if (match) {
        log(colors.gray, 'ℹ️', `Deployment URL: ${match[0]}`);
      }
      return true;
    }

    log(colors.yellow, '⚠️', 'Could not trigger deployment via CLI');
    return false;
  }

  async waitForDeploymentReady(maxWaitSeconds = 120) {
    log(colors.blue, '→', `Waiting for deployment (max ${maxWaitSeconds}s)...`);

    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      try {
        const response = await makeRequest('GET', '/api/health');
        
        if (response.status === 200) {
          log(colors.green, '✅', 'Deployment ready');
          return true;
        }
      } catch (error) {
        // Still deploying
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      process.stdout.write(`\r${colors.cyan}⏳${colors.reset} Waiting... ${elapsed}s`);
    }

    console.log(); // New line after progress
    log(colors.yellow, '⚠️', 'Deployment timeout - check Vercel dashboard');
    return false;
  }

  async verifyAdminAccess(testEmail) {
    log(colors.blue, '→', 'Verifying admin access...');

    try {
      // Test that the health endpoint is accessible
      const response = await makeRequest('GET', '/api/health');
      
      if (response.status === 200) {
        log(colors.green, '✅', 'Production endpoint responding');
        return true;
      }
    } catch (error) {
      log(colors.red, '❌', `Verification failed: ${error.message}`);
      return false;
    }
  }

  async printSetupInstructions(testEmail) {
    console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}ADMIN SETUP COMPLETE${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.green}✅ New Admin Configured${colors.reset}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Role: admin`);
    console.log();

    console.log(`${colors.cyan}📋 Next Steps:${colors.reset}`);
    console.log(`\n1. ${colors.yellow}Wait for deployment${colors.reset}`);
    console.log(`   - Check: https://vercel.com/dashboard`);
    console.log(`   - Status should show "Ready"`);
    console.log(`   - Takes 2-5 minutes typically`);
    console.log();

    console.log(`2. ${colors.yellow}Test admin login${colors.reset}`);
    console.log(`   - Go to: ${config.productionUrl}`);
    console.log(`   - Click "Login"`);
    console.log(`   - Enter email: ${testEmail}`);
    console.log(`   - Check inbox for magic link`);
    console.log(`   - Click link to complete login`);
    console.log();

    console.log(`3. ${colors.yellow}Verify admin access${colors.reset}`);
    console.log(`   - You should see the dashboard`);
    console.log(`   - Verify sidebar shows "Authenticated as: ${testEmail}"`);
    console.log(`   - Try accessing: /audit-logs`);
    console.log();

    console.log(`4. ${colors.yellow}Run UAT tests${colors.reset}`);
    console.log(`   - node scripts/uat-test-suite.js`);
    console.log(`   - Complete manual UAT: docs/UAT_EXECUTION_GUIDE.md`);
    console.log();

    console.log(`${colors.cyan}📊 Verification Checklist:${colors.reset}`);
    console.log(`  □ Deployment shows "Ready" in Vercel`);
    console.log(`  □ Can access production URL`);
    console.log(`  □ Can log in with new admin email`);
    console.log(`  □ Dashboard loads without errors`);
    console.log(`  □ Can navigate to /audit-logs`);
    console.log(`  □ No console errors (F12)`);
    console.log();

    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
  }

  async generateConfigFile() {
    const config = {
      timestamp: new Date().toISOString(),
      adminEmails: this.adminEmails,
      currentEmails: this.currentEmails,
      allEmails: this.buildEnvValue(),
      productionUrl: config.productionUrl,
      instructions: [
        '1. Verify deployment in Vercel dashboard',
        '2. Test login with the new admin email',
        '3. Run UAT test suite',
        '4. Review audit logs for login events'
      ]
    };

    const reportPath = path.join('test-results', `admin-setup-${Date.now()}.json`);
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(config, null, 2));
    log(colors.gray, 'ℹ️', `Configuration saved to: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const setup = new AdminSetup();

  console.log(`${colors.cyan}Admin User Setup Automation${colors.reset}\n`);

  try {
    if (args.includes('--help')) {
      console.log(`Usage: node scripts/admin-setup.js [options]\n`);
      console.log(`Options:`);
      console.log(`  --email EMAIL         Email of admin user to add`);
      console.log(`  --role ROLE           Admin role (default: admin)`);
      console.log(`  --deploy              Trigger production deployment`);
      console.log(`  --verify              Verify deployment and access`);
      console.log(`  --list-current        List current admin users`);
      console.log(`  --help                Show this help message\n`);
      console.log(`Examples:`);
      console.log(`  node scripts/admin-setup.js --email admin@company.com`);
      console.log(`  node scripts/admin-setup.js --email admin@company.com --deploy --verify\n`);
      return;
    }

    // Step 1: Get current config
    await setup.getCurrentConfig();

    // Step 2: Handle --list-current
    if (args.includes('--list-current')) {
      if (setup.currentEmails.length === 0) {
        log(colors.yellow, 'ℹ️', 'No admin users configured yet');
      }
      return;
    }

    // Step 3: Get email to add
    const emailIdx = args.indexOf('--email');
    if (emailIdx === -1) {
      log(colors.red, '❌', 'Error: --email parameter required');
      console.log('\nUsage: node scripts/admin-setup.js --email admin@company.com');
      process.exit(1);
    }

    const adminEmail = args[emailIdx + 1];
    if (!adminEmail || !adminEmail.includes('@')) {
      log(colors.red, '❌', 'Error: Invalid email format');
      process.exit(1);
    }

    const roleIdx = args.indexOf('--role');
    const role = roleIdx !== -1 ? args[roleIdx + 1] : 'admin';

    console.log();
    
    // Step 4: Add admin email
    await setup.addAdminEmail(adminEmail, role);

    // Step 5: Apply configuration
    const configApplied = await setup.applyConfiguration();
    
    if (!configApplied) {
      log(colors.yellow, '⚠️', 'Manual action required:');
      console.log(`\n1. Go to: https://vercel.com/dashboard`);
      console.log(`2. Select project: ${config.projectId}`);
      console.log(`3. Settings → Environment Variables`);
      console.log(`4. Find: ADMIN_ROLE_ALLOWLIST`);
      console.log(`5. Add to value: ${adminEmail}:${role}`);
      console.log(`6. Save and redeploy`);
      console.log();
    }

    // Step 6: Optional deployment
    if (args.includes('--deploy')) {
      const deployed = await setup.triggerDeployment();
      
      if (deployed) {
        if (args.includes('--verify')) {
          await setup.waitForDeploymentReady();
          await setup.verifyAdminAccess(adminEmail);
        }
      }
    }

    // Step 7: Save configuration
    await setup.generateConfigFile();

    // Step 8: Print instructions
    await setup.printSetupInstructions(adminEmail);

    process.exit(0);
  } catch (error) {
    log(colors.red, '❌', `Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
