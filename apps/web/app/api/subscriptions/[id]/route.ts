import { NextResponse } from 'next/server';
import { getSubscription, getCompany } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sub = await getSubscription(id);
  if (!sub) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const company = await getCompany(sub.companyId);
  return NextResponse.json({ subscription: sub, company: company ?? null });
}
