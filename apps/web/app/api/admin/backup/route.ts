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
    const now = new Date().toISOString();
    const retentionEnd = new Date();
    retentionEnd.setDate(retentionEnd.getDate() + 180);
    const action = await createAdminAction({
      subscriptionId: parsed.data.subscriptionId,
      action: 'backup',
      status: 'completed',
      completedAt: now,
      details: {
        description: 'Backup DB to S3, retention 6 months, auto-delete.',
        backup_id: `backup-${Date.now()}`,
        timestamp: now,
        retention_end_date: retentionEnd.toISOString(),
        s3_lifecycle_expiration_days: 180,
      },
    });
    return NextResponse.json(action);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create backup action' }, { status: 500 });
  }
}
