import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSubscription, getSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
  approved: z.boolean(),
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
    if (sub.status !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Only pending_approval subscriptions can be approved/rejected' },
        { status: 400 }
      );
    }
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      status: parsed.data.approved ? 'approved' : 'rejected',
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}
