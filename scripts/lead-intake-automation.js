#!/usr/bin/env node

/**
 * Lead Intake Automation Script
 * 
 * Purpose: Automate test lead creation via webhook to validate:
 * - Lead intake processing
 * - Webhook secret validation
 * - Database storage
 * - Rate limiting
 * - Throughput capacity
 * 
 * Usage:
 *   node scripts/lead-intake-automation.js --count 10
 *   node scripts/lead-intake-automation.js --bulk --throughput 100
 *   node scripts/lead-intake-automation.js --load-test --duration 60
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  productionUrl: process.env.UAT_BASE_URL || process.env.PRODUCTION_URL || 'https://agency-ops-suite.vercel.app',
  webhookSecret: process.env.INTAKE_WEBHOOK_SECRET || 'development-secret',
  testMode: process.env.NODE_ENV !== 'production',
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test data generators
const generators = {
  businessTypes: [
    'SaaS', 'E-Commerce', 'Marketing Agency', 'Consulting',
    'Freelance', 'Service Provider', 'Local Business', 'Non-Profit',
    'B2B', 'B2C', 'Marketplace', 'Education'
  ],

  sources: [
    'google', 'facebook', 'linkedin', 'referral',
    'direct', 'email', 'podcast', 'webinar',
    'content', 'social', 'paid-ad', 'organic'
  ],

  domains: [
    'gmail.com', 'outlook.com', 'company.com', 'business.io',
    'startup.dev', 'agency.co', 'solutions.net'
  ],

  companies: [
    'TechStart Inc', 'Digital Solutions', 'Growth Labs', 'Innovation Co',
    'NextGen Services', 'Future Systems', 'Smart Business', 'Pro Marketing'
  ],

  generateLead(index) {
    const companyName = this.companies[index % this.companies.length];
    const email = `lead-${Date.now()}-${index}@${this.domains[index % this.domains.length]}`;
    
    return {
      name: `Test Lead ${index}`,
      email: email,
      businessType: this.businessTypes[index % this.businessTypes.length],
      company: companyName,
      source: this.sources[index % this.sources.length],
      message: `Testing lead intake automation - Lead #${index} created at ${new Date().toISOString()}`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
    };
  }
};

// HTTP Request wrapper
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(config.productionUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': config.webhookSecret,
        ...headers,
      },
      timeout: 30000,
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
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

// Test scenarios
class LeadIntakeTest {
  constructor() {
    this.results = {
      successful: 0,
      failed: 0,
      rateLimited: 0,
      errors: [],
      timings: [],
      leadIds: [],
    };
  }

  async testSingleLead(index) {
    const lead = generators.generateLead(index);
    const startTime = Date.now();

    try {
      const response = await makeRequest('POST', '/api/intake/lead', lead);
      const timing = Date.now() - startTime;
      this.results.timings.push(timing);

      if (response.status === 200 || response.status === 201) {
        this.results.successful++;
        if (response.body.leadId) {
          this.results.leadIds.push(response.body.leadId);
        }
        return {
          success: true,
          status: response.status,
          timing: timing,
          leadId: response.body.leadId,
        };
      } else if (response.status === 429) {
        this.results.rateLimited++;
        return {
          success: false,
          status: response.status,
          reason: 'Rate limited',
          timing: timing,
        };
      } else {
        this.results.failed++;
        this.results.errors.push({
          index,
          status: response.status,
          body: response.body,
        });
        return {
          success: false,
          status: response.status,
          timing: timing,
        };
      }
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({
        index,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async runSequential(count, verbose = false) {
    console.log(`\n${colors.cyan}Starting sequential lead intake test (${count} leads)${colors.reset}`);
    
    for (let i = 0; i < count; i++) {
      const result = await this.testSingleLead(i);
      if (verbose) {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} Lead ${i + 1}: ${result.status || 'Error'} (${result.timing || 'N/A'}ms)`);
      }
      
      // Progress indicator every 10
      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${count}`);
      }
    }

    return this.results;
  }

  async runParallel(count, concurrency = 10, verbose = false) {
    console.log(`\n${colors.cyan}Starting parallel lead intake test (${count} leads, ${concurrency} concurrent)${colors.reset}`);
    
    for (let i = 0; i < count; i += concurrency) {
      const batch = Math.min(concurrency, count - i);
      const promises = [];

      for (let j = 0; j < batch; j++) {
        promises.push(this.testSingleLead(i + j));
      }

      const results = await Promise.all(promises);
      
      if (verbose) {
        results.forEach((result, idx) => {
          const icon = result.success ? '✅' : '❌';
          console.log(`${icon} Lead ${i + idx + 1}: ${result.status || 'Error'} (${result.timing || 'N/A'}ms)`);
        });
      }

      console.log(`  Batch ${Math.floor(i / concurrency) + 1}: Completed`);
    }

    return this.results;
  }

  async loadTest(durationSeconds, reqPerSec = 10) {
    console.log(`\n${colors.cyan}Starting load test (${durationSeconds}s @ ${reqPerSec} req/sec)${colors.reset}`);
    
    const endTime = Date.now() + (durationSeconds * 1000);
    const intervalBetweenRequests = 1000 / reqPerSec;
    let leadIndex = 0;

    const startTime = Date.now();

    while (Date.now() < endTime) {
      const requestStartTime = Date.now();
      
      // Fire requests at specified rate
      const result = await this.testSingleLead(leadIndex);
      leadIndex++;

      const elapsed = Date.now() - requestStartTime;
      const remaining = intervalBetweenRequests - elapsed;

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      // Progress update every 10 requests
      if (leadIndex % 10 === 0) {
        const actualRate = (leadIndex / ((Date.now() - startTime) / 1000)).toFixed(2);
        console.log(`  ${leadIndex} leads created @ ${actualRate} req/sec`);
      }
    }

    return this.results;
  }

  printReport() {
    const total = this.results.successful + this.results.failed + this.results.rateLimited;
    const successRate = ((this.results.successful / total) * 100).toFixed(2);
    
    console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}LEAD INTAKE TEST REPORT${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

    console.log(`${colors.green}✅ Successful:${colors.reset} ${this.results.successful}`);
    console.log(`${colors.red}❌ Failed:${colors.reset} ${this.results.failed}`);
    console.log(`${colors.yellow}⏱️  Rate Limited:${colors.reset} ${this.results.rateLimited}`);
    console.log(`${colors.blue}📊 Total:${colors.reset} ${total}`);
    console.log(`${colors.cyan}📈 Success Rate:${colors.reset} ${successRate}%\n`);

    if (this.results.timings.length > 0) {
      const timings = this.results.timings.sort((a, b) => a - b);
      const avg = (timings.reduce((a, b) => a + b) / timings.length).toFixed(2);
      const min = timings[0];
      const max = timings[timings.length - 1];
      const p95 = timings[Math.floor(timings.length * 0.95)];
      const p99 = timings[Math.floor(timings.length * 0.99)];

      console.log(`${colors.cyan}Timing Statistics (ms):${colors.reset}`);
      console.log(`  Min:  ${min}ms`);
      console.log(`  Avg:  ${avg}ms`);
      console.log(`  P95:  ${p95}ms`);
      console.log(`  P99:  ${p99}ms`);
      console.log(`  Max:  ${max}ms\n`);
    }

    if (this.results.errors.length > 0 && this.results.errors.length <= 5) {
      console.log(`${colors.yellow}Recent Errors:${colors.reset}`);
      this.results.errors.slice(0, 5).forEach((err, idx) => {
        console.log(`  ${idx + 1}. Lead ${err.index}: ${err.error || `Status ${err.status}`}`);
      });
      console.log();
    }

    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

    // Save results to file
    const reportPath = path.join('test-results', `lead-intake-${Date.now()}.json`);
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`${colors.gray}Report saved to: ${reportPath}${colors.reset}\n`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const test = new LeadIntakeTest();

  console.log(`${colors.cyan}Lead Intake Automation Script${colors.reset}`);
  console.log(`Target URL: ${config.productionUrl}`);
  console.log(`Test Mode: ${config.testMode ? 'YES' : 'NO'}\n`);

  try {
    if (args.includes('--help')) {
      console.log(`Usage: node scripts/lead-intake-automation.js [options]\n`);
      console.log(`Options:`);
      console.log(`  --count NUM           Create NUM leads sequentially (default: 10)`);
      console.log(`  --parallel NUM        Create NUM leads with 10 concurrent requests`);
      console.log(`  --concurrency NUM     Set number of concurrent requests (default: 10)`);
      console.log(`  --load-test DUR       Load test for DUR seconds at 10 req/sec`);
      console.log(`  --throughput NUM      Load test at NUM requests/sec`);
      console.log(`  --verbose             Show detailed output for each request`);
      console.log(`  --help                Show this help message\n`);
      console.log(`Examples:`);
      console.log(`  node scripts/lead-intake-automation.js --count 5`);
      console.log(`  node scripts/lead-intake-automation.js --parallel 20 --verbose`);
      console.log(`  node scripts/lead-intake-automation.js --load-test 30 --throughput 50\n`);
      return;
    }

    const verbose = args.includes('--verbose');
    let results;

    if (args.includes('--load-test')) {
      const idx = args.indexOf('--load-test');
      const duration = parseInt(args[idx + 1]) || 10;
      const throughputIdx = args.indexOf('--throughput');
      const throughput = throughputIdx !== -1 ? parseInt(args[throughputIdx + 1]) : 10;
      
      results = await test.loadTest(duration, throughput);
    } else if (args.includes('--parallel')) {
      const idx = args.indexOf('--parallel');
      const count = parseInt(args[idx + 1]) || 20;
      const concIdx = args.indexOf('--concurrency');
      const concurrency = concIdx !== -1 ? parseInt(args[concIdx + 1]) : 10;
      
      results = await test.runParallel(count, concurrency, verbose);
    } else {
      const idx = args.indexOf('--count');
      const count = idx !== -1 ? parseInt(args[idx + 1]) : 10;
      
      results = await test.runSequential(count, verbose);
    }

    test.printReport();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

main().catch(console.error);
