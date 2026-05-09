import { NextResponse, NextRequest } from "next/server";
import {
  getSystemHealth,
  getEventStatistics,
} from "@/lib/logging";
import { requireAuth, formatAuthError } from "@/lib/auth";

/**
 * GET /api/admin/system-health
 * Health check endpoint with recent event statistics
 * Query params:
 *   - window: Time window in milliseconds (default 60000 = 60 seconds)
 *   - stats: Include detailed statistics (true/false, default false)
 * REQUIRES: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const windowMs = parseInt(searchParams.get("window") || "60000", 10);
    const includeStats = searchParams.get("stats") === "true";

    const health = await getSystemHealth(windowMs);

    let stats = null;
    if (includeStats) {
      const hoursBack = Math.max(1, Math.floor(windowMs / (60 * 60 * 1000)));
      stats = await getEventStatistics(hoursBack);
    }

    return NextResponse.json(
      {
        ok: true,
        timestamp: new Date().toISOString(),
        health,
        stats,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      const { status, body } = formatAuthError(err);
      return NextResponse.json(body, { status });
    }

    console.error("[/api/admin/system-health] GET error:", err);
    return NextResponse.json(
      {
        error: "health_check_failed",
        message: err instanceof Error ? err.message : "Unknown error",
        status: "error",
      },
      { status: 500 }
    );
  }
}
