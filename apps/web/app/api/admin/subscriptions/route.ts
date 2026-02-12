import { NextResponse } from 'next/server';
import { listSubscriptions, getCompany } from '@/lib/store';

export async function GET() {
  const subscriptions = listSubscriptions();
  const withCompanies = subscriptions.map((sub) => ({
    ...sub,
    company: getCompany(sub.companyId) ?? null,
  }));
  return NextResponse.json({ subscriptions: withCompanies });
}
