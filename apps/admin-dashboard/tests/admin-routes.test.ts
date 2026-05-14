import test from 'node:test';
import assert from 'node:assert/strict';
import { GET as listAdminFiles } from '../src/app/api/admin/files/route';
import { POST as createAdminBackup } from '../src/app/api/admin/backup/route';

function makeAdminRequest(pathname: string, secret?: string) {
  return new Request(`http://localhost${pathname}`, {
    method: pathname.includes('/backup') ? 'POST' : 'GET',
    headers: secret ? { 'x-admin-secret': secret } : {},
  });
}

test('admin files route rejects non-admin access', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;
  const originalAdminDownloadSecret = process.env.ADMIN_DOWNLOAD_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.ADMIN_DOWNLOAD_SECRET = 'admin-secret';

  try {
    const response = (await listAdminFiles(makeAdminRequest('/api/admin/files'))) as Response;
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'unauthorized' });
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

test('admin files route allows matching secret', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;
  const originalAdminDownloadSecret = process.env.ADMIN_DOWNLOAD_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.ADMIN_DOWNLOAD_SECRET = 'admin-secret';

  try {
    const response = (await listAdminFiles(makeAdminRequest('/api/admin/files', 'admin-secret'))) as Response;
    assert.equal(response.status, 200);

    const payload = await response.json();
    assert.ok(Array.isArray(payload.files));
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

test('admin backup route rejects non-admin access', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevAuthBypass = process.env.DEV_AUTH_BYPASS;
  const originalAdminDownloadSecret = process.env.ADMIN_DOWNLOAD_SECRET;

  process.env.NODE_ENV = 'production';
  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.ADMIN_DOWNLOAD_SECRET = 'admin-secret';

  try {
    const response = (await createAdminBackup(makeAdminRequest('/api/admin/backup'))) as Response;
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'unauthorized' });
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
