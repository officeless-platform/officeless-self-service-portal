import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSubscription, getSubscription } from '@/lib/store';
import type { AwsOnboardingMode } from '@/lib/data';

const bodySchema = z.object({
  subscriptionId: z.string(),
  awsMode: z.enum(['A', 'B', 'C'] as const satisfies AwsOnboardingMode[]),
  awsRoleArn: z.string().optional(),
  awsAccountId: z.string().optional(),
  awsRegion: z.string().optional(),
});

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
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      awsMode: parsed.data.awsMode,
      awsRoleArn: parsed.data.awsRoleArn,
      awsAccountId: parsed.data.awsAccountId,
      awsRegion: parsed.data.awsRegion,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update AWS mode' }, { status: 500 });
  }
}
