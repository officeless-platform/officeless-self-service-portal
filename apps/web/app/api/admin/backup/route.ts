import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminAction, getSubscription, updateSubscription } from '@/lib/store';

const bodySchema = z.object({
  subscriptionId: z.string(),
});

const S3_BUCKET = 'officeless-backups';

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
      return NextResponse.json({ error: 'Environment is destroyed; backup not available.' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const backupId = `backup-${Date.now()}`;
    const s3Location = `s3://${S3_BUCKET}/${parsed.data.subscriptionId}/${backupId}.snapshot`;
    const retentionEnd = new Date();
    retentionEnd.setDate(retentionEnd.getDate() + 180);
    const updated = await updateSubscription(parsed.data.subscriptionId, {
      lastBackup: { s3Location, completedAt: now },
    });
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
    const action = await createAdminAction({
      subscriptionId: parsed.data.subscriptionId,
      action: 'backup',
      status: 'completed',
      completedAt: now,
      details: {
        description: 'Backup DB to S3, retention 6 months, auto-delete.',
        s3Location,
        backup_id: backupId,
        timestamp: now,
        retention_end_date: retentionEnd.toISOString(),
        s3_lifecycle_expiration_days: 180,
      },
    });
    return NextResponse.json({ subscription: updated, action, s3Location });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to run backup' }, { status: 500 });
  }
}
