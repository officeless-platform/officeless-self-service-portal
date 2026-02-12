import { NextResponse } from 'next/server';
import { listSubscriptions, getCompany } from '@/lib/store';

export async function GET() {
  const subs = await listSubscriptions();
  const withCompanies = await Promise.all(
    subs.map(async (sub) => ({
      ...sub,
      company: (await getCompany(sub.companyId)) ?? null,
    }))
  );
  return NextResponse.json({ subscriptions: withCompanies });
}
