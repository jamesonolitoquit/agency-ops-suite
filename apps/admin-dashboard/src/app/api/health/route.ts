import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * 
 * Simple health check endpoint that verifies the application is running.
 * Used by monitoring systems and load balancers for uptime verification.
 * 
 * No authentication required - this is intentionally public for monitoring.
 */
export async function GET() {
  try {
    // Basic health check - just verify the app is running
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
