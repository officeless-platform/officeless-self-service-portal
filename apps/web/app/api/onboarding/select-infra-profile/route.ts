import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSubscription, getSubscription } from '@/lib/store';
import type { InfraProfileId } from '@/lib/data';

const bodySchema = z.object({
  subscriptionId: z.string(),
  infraProfileId: z.enum(['P0', 'P1', 'P2', 'P3', 'P4'] as const satisfies InfraProfileId[]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const sub = getSubscription(parsed.data.subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    const updated = updateSubscription(parsed.data.subscriptionId, {
      infraProfileId: parsed.data.infraProfileId,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update infra profile' }, { status: 500 });
  }
}
