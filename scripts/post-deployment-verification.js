#!/usr/bin/env node

/**
 * Post-Deployment Verification Suite
 * 
 * Purpose: Comprehensive 48-hour health check after production deployment:
 * - Monitor error rates and patterns
 * - Track API response times
 * - Verify critical endpoints
 * - Check database connectivity
 * - Generate trend analysis
 * - Alert on anomalies
 * 
 * Usage:
 *   node scripts/post-deployment-verification.js --watch 120
 *   node scripts/post-deployment-verification.js --continuous --interval 5
 *   node scripts/post-deployment-verification.js --report
 *   node scripts/post-deployment-verification.js --analyze 48
 */

const https = require('https');
const http = require('http');
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
  magenta: '\x1b[35m',
};

const config = {
  productionUrl: process.env.PRODUCTION_URL || 'https://agency-ops-suite.vercel.app',
  metricsDir: path.join(process.cwd(), 'test-results', 'deployment-metrics'),
};

// Utility functions
function log(color, label, message) {
  console.log(`${color}${label}${colors.reset} ${message}`);
}

function makeRequest(method, path, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(config.productionUrl + path);

    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      timeout: timeout,
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          timing: Date.now() - startTime,
          success: res.statusCode < 500,
          data: data,
        });
      });
    });

    req.on('error', () => {
      resolve({
        status: 0,
        timing: Date.now() - startTime,
        success: false,
        error: 'Connection error',
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        timing: Date.now() - startTime,
        success: false,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

// Verification class
class PostDeploymentVerification {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      checks: [],
      errors: [],
      trends: {
        errorRate: [],
        responseTime: [],
        availability: [],
      },
    };
    this.ensureMetricsDir();
  }

  ensureMetricsDir() {
    if (!fs.existsSync(config.metricsDir)) {
      fs.mkdirSync(config.metricsDir, { recursive: true });
    }
  }

  async checkEndpoint(name, path, expectedStatus = 200) {
    const result = await makeRequest('GET', path);
    
    const success = Array.isArray(expectedStatus)
      ? expectedStatus.includes(result.status)
      : result.status === expectedStatus;

    const check = {
      name,
      path,
      status: result.status,
      timing: result.timing,
      success,
      timestamp: new Date().toISOString(),
    };

    this.metrics.checks.push(check);

    // Log result
    const icon = check.success ? '✅' : '❌';
    const statusColor = check.success ? colors.green : colors.red;
    console.log(`${icon} ${name.padEnd(25)} ${statusColor}${result.status}${colors.reset} ${result.timing}ms`);

    if (!check.success) {
      this.metrics.errors.push({
        name,
        status: result.status,
        timestamp: check.timestamp,
      });
    }

    return check;
  }

  async runHealthCheck() {
    console.log(`${colors.cyan}🏥 Health Check${colors.reset}\n`);

    const checks = [
      { name: 'Health Endpoint', path: '/api/health', expected: 200 },
      // Public dashboard may redirect to login in dev (3xx), accept redirects
      { name: 'Dashboard (Public)', path: '/', expected: [200, 301, 302, 307] },
      { name: 'API Contracts', path: '/api/contracts', expected: 401 },
      // Public audit route exists without auth; invalid token should be a controlled client error
      { name: 'API Audit (public)', path: '/api/audit/public/testtoken123', expected: [200, 404] },
    ];

    for (const check of checks) {
      await this.checkEndpoint(check.name, check.path, check.expected);
    }

    console.log();
  }

  async runPerformanceCheck(iterations = 5) {
    console.log(`${colors.cyan}⚡ Performance Check${colors.reset}\n`);

    const timings = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await makeRequest('GET', '/api/health');
      timings.push(result.timing);
      
      if (i === iterations - 1) {
        console.log(`Health endpoint: ${result.timing}ms`);
      }
    }

    const avgTiming = Math.round(timings.reduce((a, b) => a + b) / timings.length);
    const maxTiming = Math.max(...timings);
    const minTiming = Math.min(...timings);

    this.metrics.trends.responseTime.push({
      timestamp: new Date().toISOString(),
      avg: avgTiming,
      min: minTiming,
      max: maxTiming,
    });

    console.log(`Average response time: ${avgTiming}ms`);
    console.log(`Min/Max: ${minTiming}ms / ${maxTiming}ms`);
    console.log();
  }

  async runErrorRateCheck(sampleSize = 20) {
    console.log(`${colors.cyan}📊 Error Rate Check${colors.reset}\n`);

    let errorCount = 0;
    let totalRequests = 0;

    // Check various endpoints
    const endpoints = [
      '/api/health',
      '/api/contracts',
      '/api/audit/public/testtoken123',
    ];

    for (const endpoint of endpoints) {
      for (let i = 0; i < Math.ceil(sampleSize / 3); i++) {
        const result = await makeRequest('GET', endpoint);
        totalRequests++;
        
        if (!result.success) {
          errorCount++;
        }
      }
    }

    const errorRate = ((errorCount / totalRequests) * 100).toFixed(2);
    
    this.metrics.trends.errorRate.push({
      timestamp: new Date().toISOString(),
      errorRate: parseFloat(errorRate),
      errorCount,
      totalRequests,
    });

    const errorRateColor = errorRate > 5 ? colors.red : 
                          errorRate > 1 ? colors.yellow : 
                          colors.green;

    console.log(`Error Rate: ${errorRateColor}${errorRate}%${colors.reset} (${errorCount}/${totalRequests})`);
    console.log();
  }

  async runAvailabilityCheck() {
    console.log(`${colors.cyan}📡 Availability Check${colors.reset}\n`);

    const result = await makeRequest('GET', '/api/health');
    const isAvailable = result.status === 200;

    this.metrics.trends.availability.push({
      timestamp: new Date().toISOString(),
      available: isAvailable,
      responseTime: result.timing,
    });

    const icon = isAvailable ? '✅' : '❌';
    const status = isAvailable ? `${colors.green}AVAILABLE${colors.reset}` : `${colors.red}DOWN${colors.reset}`;

    console.log(`${icon} Status: ${status}`);
    console.log(`Response Time: ${result.timing}ms`);
    console.log();
  }

  async runFullCheck() {
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}POST-DEPLOYMENT VERIFICATION CHECK${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);

    const startTime = Date.now();

    try {
      await this.runHealthCheck();
      await this.runAvailabilityCheck();
      await this.runPerformanceCheck();
      await this.runErrorRateCheck();

      const duration = Date.now() - startTime;
      console.log(`${colors.gray}Check completed in ${duration}ms${colors.reset}\n`);

      this.printCheckSummary();
      return true;
    } catch (error) {
      log(colors.red, '❌', `Check failed: ${error.message}`);
      return false;
    }
  }

  printCheckSummary() {
    const totalChecks = this.metrics.checks.length;
    const successfulChecks = this.metrics.checks.filter(c => c.success).length;
    const failedChecks = this.metrics.checks.filter(c => !c.success).length;

    console.log(`${colors.cyan}📋 Summary${colors.reset}`);
    console.log(`Total checks: ${totalChecks}`);
    console.log(`✅ Successful: ${colors.green}${successfulChecks}${colors.reset}`);
    console.log(`❌ Failed: ${failedChecks > 0 ? colors.red : colors.gray}${failedChecks}${colors.reset}`);
    console.log();

    if (this.metrics.errors.length > 0) {
      console.log(`${colors.yellow}⚠️  Issues Found:${colors.reset}`);
      this.metrics.errors.forEach(err => {
        console.log(`  • ${err.name}: Status ${err.status}`);
      });
      console.log();
    }
  }

  async saveMetrics() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
    const filename = `metrics-${timestamp}.json`;
    const filepath = path.join(config.metricsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    log(colors.gray, 'ℹ️', `Metrics saved to: ${filepath}`);
  }

  async analyzeMetrics(hoursBack = 24) {
    console.log(`${colors.cyan}📈 Metrics Analysis${colors.reset}\n`);

    const files = fs.readdirSync(config.metricsDir)
      .filter(f => f.startsWith('metrics-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      log(colors.yellow, 'ℹ️', 'No metrics files found');
      return;
    }

    console.log(`Found ${files.length} metric snapshots\n`);

    // Calculate trends
    let totalErrorRate = 0;
    let maxErrorRate = 0;
    let totalResponseTime = 0;
    let maxResponseTime = 0;
    let availableCount = 0;
    let totalCount = 0;

    for (const file of files) {
      const filepath = path.join(config.metricsDir, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      if (data.trends.errorRate.length > 0) {
        const latest = data.trends.errorRate[data.trends.errorRate.length - 1];
        totalErrorRate += latest.errorRate;
        maxErrorRate = Math.max(maxErrorRate, latest.errorRate);
      }

      if (data.trends.responseTime.length > 0) {
        const latest = data.trends.responseTime[data.trends.responseTime.length - 1];
        totalResponseTime += latest.avg;
        maxResponseTime = Math.max(maxResponseTime, latest.max);
      }

      if (data.trends.availability.length > 0) {
        data.trends.availability.forEach(check => {
          totalCount++;
          if (check.available) availableCount++;
        });
      }
    }

    const avgErrorRate = (totalErrorRate / files.length).toFixed(2);
    const availability = ((availableCount / totalCount) * 100).toFixed(2);
    const avgResponseTime = (totalResponseTime / files.length).toFixed(0);

    console.log(`${colors.cyan}Trend Analysis (${files.length} snapshots):${colors.reset}`);
    console.log(`  Error Rate:       ${avgErrorRate}% (max: ${maxErrorRate.toFixed(2)}%)`);
    console.log(`  Response Time:    ${avgResponseTime}ms avg (peak: ${maxResponseTime}ms)`);
    console.log(`  Availability:     ${availability}%`);
    console.log();

    // Generate alerts
    if (parseFloat(avgErrorRate) > 1) {
      log(colors.yellow, '⚠️', 'Warning: Error rate above 1%');
    }
    if (parseFloat(avgResponseTime) > 500) {
      log(colors.yellow, '⚠️', 'Warning: Average response time above 500ms');
    }
    if (parseFloat(availability) < 99) {
      log(colors.red, '❌', 'Alert: Availability below 99%');
    }

    console.log();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const verification = new PostDeploymentVerification();

  try {
    if (args.includes('--help')) {
      console.log(`Usage: node scripts/post-deployment-verification.js [options]\n`);
      console.log(`Options:`);
      console.log(`  --watch TIME        Run checks for TIME minutes`);
      console.log(`  --continuous        Run checks continuously`);
      console.log(`  --interval SECS     Interval between checks (default: 60, use with --continuous)`);
      console.log(`  --report            Print report from saved metrics`);
      console.log(`  --analyze HOURS     Analyze metrics from last HOURS hours`);
      console.log(`  --help              Show this help message\n`);
      console.log(`Examples:`);
      console.log(`  node scripts/post-deployment-verification.js --watch 120`);
      console.log(`  node scripts/post-deployment-verification.js --continuous --interval 5`);
      console.log(`  node scripts/post-deployment-verification.js --analyze 24\n`);
      return;
    }

    if (args.includes('--analyze')) {
      const idx = args.indexOf('--analyze');
      const hours = parseInt(args[idx + 1]) || 24;
      await verification.analyzeMetrics(hours);
      return;
    }

    if (args.includes('--report')) {
      await verification.analyzeMetrics();
      return;
    }

    if (args.includes('--watch')) {
      const idx = args.indexOf('--watch');
      const watchArg = parseInt(args[idx + 1], 10);

      // `--watch 0` is treated as a single immediate check.
      if (!Number.isNaN(watchArg) && watchArg <= 0) {
        await verification.runFullCheck();
        await verification.saveMetrics();
        return;
      }

      const minutes = Number.isNaN(watchArg) ? 10 : watchArg;
      const milliseconds = minutes * 60 * 1000;
      const endTime = Date.now() + milliseconds;

      console.log(`${colors.cyan}Watching for ${minutes} minutes...${colors.reset}\n`);

      let checkCount = 0;
      while (Date.now() < endTime) {
        checkCount++;
        console.log(`${colors.gray}[Check #${checkCount}] ${new Date().toLocaleTimeString()}${colors.reset}`);
        
        await verification.runFullCheck();
        await verification.saveMetrics();

        const remaining = endTime - Date.now();
        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds between checks
        }
      }

      console.log(`${colors.green}✅ Monitoring completed${colors.reset}`);
      return;
    }

    if (args.includes('--continuous')) {
      const intervalIdx = args.indexOf('--interval');
      const interval = intervalIdx !== -1 ? parseInt(args[intervalIdx + 1]) : 60;

      console.log(`${colors.cyan}Running continuous monitoring (${interval}s interval)...${colors.reset}`);
      console.log(`Press Ctrl+C to stop\n`);

      let checkCount = 0;
      while (true) {
        checkCount++;
        console.log(`${colors.gray}[Check #${checkCount}] ${new Date().toLocaleTimeString()}${colors.reset}`);
        
        await verification.runFullCheck();
        await verification.saveMetrics();

        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
    }

    // Default: single check
    await verification.runFullCheck();
    await verification.saveMetrics();

  } catch (error) {
    log(colors.red, '❌', `Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
