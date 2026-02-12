import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSubscription, getSubscription } from '@/lib/store';
import { recordTacAcceptance } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
  userId: z.string(),
  termsVersion: z.string(),
  ipHash: z.string().optional(),
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
    if (sub.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft subscriptions can be submitted' },
        { status: 400 }
      );
    }
    await recordTacAcceptance({
      userId: parsed.data.userId,
      subscriptionId: parsed.data.subscriptionId,
      termsVersion: parsed.data.termsVersion,
      ipHash: parsed.data.ipHash,
    });
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      status: 'pending_approval',
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
