import { NextResponse } from 'next/server';

/**
 * Mock environment API: health status only.
 * GET /api/env/[envId] returns a static health payload so the endpoint is available.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ envId: string }> }
) {
  const { envId } = await params;
  return NextResponse.json({
    status: 'healthy',
    env: envId,
    timestamp: new Date().toISOString(),
  });
}
