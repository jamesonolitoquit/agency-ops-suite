import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface ProvisioningHealth {
  status: HealthStatus;
  timestamp: string;
  metrics: {
    totalRuns: number;
    successRate: number;
    failureRate: number;
    pendingCount: number;
    successCount: number;
    failedCount: number;
    avgCompletionTime: number | null;
    stalledRunsCount: number;
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    message: string;
  }>;
  recommendations: string[];
}

const STALLED_THRESHOLD_MINUTES = 30;
const CRITICAL_FAILURE_RATE = 0.5; // 50%
const WARNING_FAILURE_RATE = 0.25; // 25%

export async function GET(): Promise<NextResponse<ProvisioningHealth>> {
  try {
    const supabase = createServiceClient();

    // Fetch all provisioning runs
    const { data: runs, error } = await supabase
      .from('provisioning_runs')
      .select('*')
      .order('started_at', { ascending: false });

    if (error || !runs) {
      console.error('[health/provisioning] failed to fetch runs:', error?.message);
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          metrics: {
            totalRuns: 0,
            successRate: 0,
            failureRate: 0,
            pendingCount: 0,
            successCount: 0,
            failedCount: 0,
            avgCompletionTime: null,
            stalledRunsCount: 0,
          },
          alerts: [
            {
              level: 'critical',
              message: `Failed to fetch provisioning runs: ${error?.message || 'Unknown error'}`,
            },
          ],
          recommendations: ['Check Supabase connectivity and permissions'],
        },
        { status: 500 }
      );
    }

    // Calculate metrics
    const now = new Date();
    const successRuns = runs.filter((r) => r.status === 'success');
    const failedRuns = runs.filter((r) => r.status === 'failed');
    const pendingRuns = runs.filter((r) => r.status === 'pending' || r.status === 'in_progress');
    const activeRuns = runs.filter((r) => r.status === 'in_progress');

    // Calculate average completion time (in minutes)
    const completedRuns = runs.filter((r) => r.completed_at && r.started_at);
    let avgCompletionTime: number | null = null;
    if (completedRuns.length > 0) {
      const totalTime = completedRuns.reduce((sum, r) => {
        const started = new Date(r.started_at).getTime();
        const completed = new Date(r.completed_at).getTime();
        return sum + (completed - started);
      }, 0);
      avgCompletionTime = Math.round(totalTime / completedRuns.length / 60000);
    }

    // Find stalled runs (pending for more than threshold)
    const stalledRuns = pendingRuns.filter((r) => {
      const startedTime = new Date(r.started_at).getTime();
      const elapsedMinutes = (now.getTime() - startedTime) / 60000;
      return elapsedMinutes > STALLED_THRESHOLD_MINUTES;
    });

    // Calculate success/failure rates (last 30 runs for recent trend)
    const recentRuns = runs.slice(0, 30);
    const recentSuccessCount = recentRuns.filter((r) => r.status === 'success').length;
    const recentFailedCount = recentRuns.filter((r) => r.status === 'failed').length;
    const successRate = recentRuns.length > 0 ? recentSuccessCount / recentRuns.length : 0;
    const failureRate = recentRuns.length > 0 ? recentFailedCount / recentRuns.length : 0;

    // Build alerts and recommendations
    const alerts: ProvisioningHealth['alerts'] = [];
    const recommendations: string[] = [];

    if (stalledRuns.length > 0) {
      alerts.push({
        level: 'critical',
        message: `${stalledRuns.length} provisioning run(s) stuck for over ${STALLED_THRESHOLD_MINUTES} minutes`,
      });
    }

    if (failureRate >= CRITICAL_FAILURE_RATE) {
      alerts.push({
        level: 'critical',
        message: `High failure rate detected: ${(failureRate * 100).toFixed(1)}% (Critical threshold: ${(CRITICAL_FAILURE_RATE * 100).toFixed(0)}%)`,
      });
    } else if (failureRate >= WARNING_FAILURE_RATE) {
      alerts.push({
        level: 'warning',
        message: `Elevated failure rate: ${(failureRate * 100).toFixed(1)}% (Warning threshold: ${(WARNING_FAILURE_RATE * 100).toFixed(0)}%)`,
      });
    }

    if (pendingRuns.length > 5) {
      alerts.push({
        level: 'warning',
        message: `${pendingRuns.length} provisioning runs pending (normal is 0-3)`,
      });
    }

    if (activeRuns.length > 0) {
      recommendations.push(
        `${activeRuns.length} provisioning run(s) are actively in progress; verify they are advancing as expected`
      );
    }

    if (runs.length === 0) {
      alerts.push({
        level: 'info',
        message: 'No provisioning runs found yet',
      });
    }

    // Continue recommendations
    if (stalledRuns.length > 0) {
      recommendations.push(
        `Review and resolve stalled runs: ${stalledRuns.map((r) => r.id).join(', ')}`
      );
    }

    if (failureRate >= WARNING_FAILURE_RATE) {
      recommendations.push('Check recent provisioning failures for common error patterns');
      recommendations.push('Review deployment checklist items for clients');
    }

    if (pendingRuns.length > 5) {
      recommendations.push('Monitor pending runs and increase provisioning concurrency if needed');
    }

    if (avgCompletionTime && avgCompletionTime > 60) {
      recommendations.push(
        `Average provisioning takes ${avgCompletionTime} minutes - consider optimizing templates or infrastructure`
      );
    }

    // Determine overall health status
    let status: HealthStatus = 'healthy';
    if (stalledRuns.length > 0 || failureRate >= CRITICAL_FAILURE_RATE) {
      status = 'unhealthy';
    } else if (failureRate >= WARNING_FAILURE_RATE || pendingRuns.length > 5) {
      status = 'degraded';
    }

    const healthReport: ProvisioningHealth = {
      status,
      timestamp: new Date().toISOString(),
      metrics: {
        totalRuns: runs.length,
        successRate: Math.round(successRate * 100),
        failureRate: Math.round(failureRate * 100),
        pendingCount: pendingRuns.length,
        successCount: successRuns.length,
        failedCount: failedRuns.length,
        avgCompletionTime,
        stalledRunsCount: stalledRuns.length,
      },
      alerts,
      recommendations,
    };

    // Log health report
    console.warn('[health/provisioning] report:', {
      status: healthReport.status,
      metrics: healthReport.metrics,
      alertCount: alerts.length,
    });

    // Return with appropriate status code
    const httpStatus = status === 'unhealthy' ? 503 : 200;
    return NextResponse.json(healthReport, { status: httpStatus });
  } catch (err) {
    console.error('[health/provisioning] unhandled exception:', err);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        metrics: {
          totalRuns: 0,
          successRate: 0,
          failureRate: 0,
          pendingCount: 0,
          successCount: 0,
          failedCount: 0,
          avgCompletionTime: null,
          stalledRunsCount: 0,
        },
        alerts: [
          {
            level: 'critical',
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        ],
        recommendations: ['Contact support if issue persists'],
      },
      { status: 500 }
    );
  }
}
