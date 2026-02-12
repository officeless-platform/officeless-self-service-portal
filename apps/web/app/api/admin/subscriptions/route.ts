import { NextResponse } from 'next/server';
import { listSubscriptions, getCompany } from '@/lib/store';

export async function GET() {
  try {
    const subs = await listSubscriptions();
    const withCompanies = await Promise.all(
      subs.map(async (sub) => ({
        ...sub,
        company: (await getCompany(sub.companyId)) ?? null,
      }))
    );
    return NextResponse.json({ subscriptions: withCompanies });
  } catch (e) {
    console.error('GET /api/admin/subscriptions:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to list subscriptions' },
      { status: 500 }
    );
  }
}
