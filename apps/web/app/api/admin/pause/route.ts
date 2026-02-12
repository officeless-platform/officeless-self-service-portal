import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminAction, getSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
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
    const action = await createAdminAction({
      subscriptionId: parsed.data.subscriptionId,
      action: 'pause',
      status: 'pending',
      details: {
        description: 'Scale node group to 0, retain DB. Mock: no real AWS change.',
      },
    });
    return NextResponse.json(action);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create pause action' }, { status: 500 });
  }
}
