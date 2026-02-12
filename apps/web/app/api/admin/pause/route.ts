import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminAction, getSubscription, updateSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
  unpause: z.boolean().optional(),
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
    if (sub.destroyed) {
      return NextResponse.json({ error: 'Environment is destroyed; cannot pause or unpause.' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const unpause = parsed.data.unpause === true;
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      paused: unpause ? false : true,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
    const action = await createAdminAction({
      subscriptionId: parsed.data.subscriptionId,
      action: 'pause',
      status: 'completed',
      completedAt: now,
      details: {
        description: unpause ? 'Scaled node group up; infrastructure resumed.' : 'Scaled node group to 0; database retained.',
      },
    });
    return NextResponse.json({ subscription: updated, action });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to pause/unpause' }, { status: 500 });
  }
}
