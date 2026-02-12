import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscription, updateSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
});

/** Generate mock endpoints for the environment (mock: no real infra). */
function mockEndpoints(subscriptionId: string, envName: string): {
  dashboardUrl: string;
  apiEndpoint: string;
  awsConsoleUrl: string;
  awsAccountId: string;
  region: string;
} {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://officeless-self-service-portal.vercel.app';
  const accountId = '123456789012';
  const region = 'us-east-1';
  return {
    dashboardUrl: `${base}/onboarding/status?id=${subscriptionId}`,
    apiEndpoint: `${base}/api/env/${envName}`,
    awsConsoleUrl: `https://${accountId}.signin.aws.amazon.com/console`,
    awsAccountId: accountId,
    region,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const sub = await getSubscription(parsed.data.subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    if (sub.status !== 'provisioning') {
      return NextResponse.json(
        { error: 'Only provisioning subscriptions can be completed' },
        { status: 400 }
      );
    }
    const now = new Date().toISOString();
    const endpoints = mockEndpoints(sub.id, sub.envName);
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      status: 'ready',
      initialSetupShownAt: now,
      endpoints,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to complete provisioning' }, { status: 500 });
  }
}
