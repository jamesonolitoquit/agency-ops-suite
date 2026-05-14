import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAccessContext } from '../src/lib/access';

test('non-admin email is rejected when not in the allowlist', () => {
  const originalAdminEmailAllowlist = process.env.ADMIN_EMAIL_ALLOWLIST;
  const originalAdminRoleAllowlist = process.env.ADMIN_ROLE_ALLOWLIST;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;

  process.env.ADMIN_EMAIL_ALLOWLIST = 'admin@example.com';
  process.env.ADMIN_ROLE_ALLOWLIST = 'admin@example.com:admin';
  process.env.DEV_AUTH_BYPASS = 'false';

  try {
    const access = resolveAccessContext('viewer@example.com', false);

    assert.equal(access.email, 'viewer@example.com');
    assert.equal(access.role, null);
    assert.equal(access.hasAccess, false);
  } finally {
    if (originalAdminEmailAllowlist === undefined) {
      delete process.env.ADMIN_EMAIL_ALLOWLIST;
    } else {
      process.env.ADMIN_EMAIL_ALLOWLIST = originalAdminEmailAllowlist;
    }

    if (originalAdminRoleAllowlist === undefined) {
      delete process.env.ADMIN_ROLE_ALLOWLIST;
    } else {
      process.env.ADMIN_ROLE_ALLOWLIST = originalAdminRoleAllowlist;
    }

    if (originalDevAuthBypass === undefined) {
      delete process.env.DEV_AUTH_BYPASS;
    } else {
      process.env.DEV_AUTH_BYPASS = originalDevAuthBypass;
    }
  }
});
