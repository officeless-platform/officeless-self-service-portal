import { NextResponse } from 'next/server';
import { getSubscription, getCompany } from '@/lib/store';

function ensureApplicationLoginUrl(sub: { id: string; endpoints?: { applicationLoginUrl?: string } }): typeof sub {
  if (!sub.endpoints?.applicationLoginUrl) {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://officeless-self-service-portal.vercel.app';
    return {
      ...sub,
      endpoints: sub.endpoints
        ? { ...sub.endpoints, applicationLoginUrl: `${base}/app/login?subscriptionId=${sub.id}` }
        : undefined,
    };
  }
  return sub;
}

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
  const subscription = ensureApplicationLoginUrl(sub);
  return NextResponse.json({ subscription, company: company ?? null });
}
