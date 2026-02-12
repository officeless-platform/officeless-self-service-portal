import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminAction, getSubscription, updateSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
  confirmCompanyName: z.string(),
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
      return NextResponse.json({ error: 'Environment is already destroyed.' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      destroyed: true,
    });
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
    const action = await createAdminAction({
      subscriptionId: parsed.data.subscriptionId,
      action: 'destroy',
      status: 'completed',
      completedAt: now,
      details: {
        description: 'Destroyed VPC, EKS, EFS, S3, DB; revoked IAM/OIDC.',
        confirmCompanyName: parsed.data.confirmCompanyName,
        destroy_plan: [
          'VPC, subnets, NAT, IGW, route tables',
          'EKS cluster and node groups',
          'EFS, S3, ALB resources',
          'DB resources (if managed)',
        ],
      },
    });
    return NextResponse.json({ subscription: updated, action });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to destroy' }, { status: 500 });
  }
}
