#!/usr/bin/env node
/**
 * Test utility: Generate valid JWT tokens for local testing
 * 
 * Usage:
 *   const { generateTestToken } = require('./test-auth-token');
 *   const token = generateTestToken({ email: 'test@example.com', role: 'admin' });
 */

function generateTestToken(options = {}) {
  const {
    sub = 'test-user-id',
    email = 'test@example.com',
    role = 'admin',
    expiresInHours = 24,
  } = options;

  // JWT header (base64-encoded)
  const header = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  ).toString('base64');

  // Expiration time (now + expiresInHours)
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;

  // JWT payload (base64-encoded)
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      email,
      exp,
      user_metadata: {
        role,
      },
    })
  ).toString('base64');

  // Dummy signature (for local testing, not cryptographically valid)
  const signature = Buffer.from('test-signature').toString('base64');

  // Combine parts
  const token = `${header}.${payload}.${signature}`;
  return token;
}

// Export for use in tests
module.exports = {
  generateTestToken,
};

// CLI usage
if (require.main === module) {
  const token = generateTestToken();
  console.log('Generated test JWT token:');
  console.log(token);
  console.log('\nUsage in tests:');
  console.log(`API_BASE_URL=http://localhost:3000 AUTH_TOKEN="${token}" node test-delete-behavior.js`);
}
