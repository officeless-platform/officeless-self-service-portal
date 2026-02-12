import { NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSubscription, getSubscription } from '@/lib/store';
import type { PackageId } from '@/lib/data';

const bodySchema = z.object({
  subscriptionId: z.string(),
  packageId: z.enum([
    'student',
    'essentials',
    'starter',
    'growth',
    'pro',
    'ultimate',
    'enterprise',
  ] as const satisfies PackageId[]),
  addOns: z.array(z.string()).optional(),
  contractMonths: z.number().min(6).optional(),
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
      packageId: parsed.data.packageId,
      addOns: parsed.data.addOns ?? sub.addOns,
      contractMonths: parsed.data.contractMonths ?? sub.contractMonths,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}
