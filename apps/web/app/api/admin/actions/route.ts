import { NextResponse } from 'next/server';
import { listAdminActions } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get('subscriptionId');
  const actions = listAdminActions(subscriptionId ?? undefined);
  return NextResponse.json({ actions });
}
