import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdmin, requireAdmin } from '../src/lib/admin-auth';

function makeRequest(secret?: string) {
  return new Request('http://localhost/api/admin/files', {
    headers: secret ? { 'x-admin-secret': secret } : {},
  });
}

test('admin guard allows matching secret', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;
  const originalAdminDownloadSecret = process.env.ADMIN_DOWNLOAD_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.ADMIN_DOWNLOAD_SECRET = 'admin-secret';

  try {
    assert.equal(isAdmin(makeRequest('admin-secret')), true);
    assert.doesNotThrow(() => requireAdmin(makeRequest('admin-secret')));
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalDevAuthBypass === undefined) {
      delete process.env.DEV_AUTH_BYPASS;
    } else {
      process.env.DEV_AUTH_BYPASS = originalDevAuthBypass;
    }

    if (originalAdminDownloadSecret === undefined) {
      delete process.env.ADMIN_DOWNLOAD_SECRET;
    } else {
      process.env.ADMIN_DOWNLOAD_SECRET = originalAdminDownloadSecret;
    }
  }
});

test('admin guard rejects missing or wrong secret', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;
  const originalAdminDownloadSecret = process.env.ADMIN_DOWNLOAD_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.ADMIN_DOWNLOAD_SECRET = 'admin-secret';

  try {
    assert.equal(isAdmin(makeRequest()), false);

    try {
      requireAdmin(makeRequest());
      assert.fail('Expected requireAdmin to throw for missing secret');
    } catch (error) {
      assert.equal((error as Response).status, 401);
    }

    try {
      requireAdmin(makeRequest('wrong-secret'));
      assert.fail('Expected requireAdmin to throw for wrong secret');
    } catch (error) {
      assert.equal((error as Response).status, 401);
    }
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalDevAuthBypass === undefined) {
      delete process.env.DEV_AUTH_BYPASS;
    } else {
      process.env.DEV_AUTH_BYPASS = originalDevAuthBypass;
    }

    if (originalAdminDownloadSecret === undefined) {
      delete process.env.ADMIN_DOWNLOAD_SECRET;
    } else {
      process.env.ADMIN_DOWNLOAD_SECRET = originalAdminDownloadSecret;
    }
  }
});
