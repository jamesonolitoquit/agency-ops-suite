import { NextResponse } from 'next/server';
import { resolveServerSupabaseKey } from '@/lib/supabase/env';

/**
 * Schema Health Check Endpoint
 * Fast check: verifies DB connectivity and core table access
 * Returns 200 if schema is accessible
 * Returns 503 if schema problems detected
 */

export async function GET() {
  try {
    // Test 1: Verify environment is set
    const serviceKey = resolveServerSupabaseKey();
    if (!serviceKey) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          reason: 'Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY',
        },
        { status: 503 }
      );
    }

    // Test 2: Try to create service client (validates URL + key format)
    const { createServiceClient } = await import('@/lib/supabase/service');
    let client;
    try {
      client = createServiceClient();
    } catch (err: any) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          reason: 'Failed to initialize Supabase client',
          error: err.message,
        },
        { status: 503 }
      );
    }

    // Test 3: Quick connectivity test - query clients table
    try {
      const { data, error } = await client
        .from('clients')
        .select('id')
        .limit(1);

      // Any table existence error indicates schema problem
      if (error?.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            status: 'unhealthy',
            reason: 'Core tables missing from schema',
            error: error.message,
          },
          { status: 503 }
        );
      }
    } catch (err: any) {
      // Network or other errors during query
      return NextResponse.json(
        {
          status: 'unhealthy',
          reason: 'Failed to query database',
          error: err.message,
        },
        { status: 503 }
      );
    }

    // Schema is healthy
    return NextResponse.json({
      status: 'healthy',
      message: 'Schema is accessible',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[health/schema]', err);
    return NextResponse.json(
      {
        status: 'unhealthy',
        reason: 'Unexpected error during health check',
        error: String(err.message || err),
      },
      { status: 503 }
    );
  }
}
