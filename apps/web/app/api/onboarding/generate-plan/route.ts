import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { InfraProfileId } from '@/lib/data';
import { generatePlan, INFRA_PROFILE_OVERRIDES } from '@/lib/terraform-catalog';
import { estimate, type CostEstimateInput } from '@/lib/cost-estimator';
import { updateSubscription, getSubscription } from '@/lib/store';

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
    const sub = getSubscription(parsed.data.subscriptionId);
    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const profileId = sub.infraProfileId as InfraProfileId;
    const overrides = INFRA_PROFILE_OVERRIDES[profileId];
    if (!overrides) {
      return NextResponse.json({ error: 'Unknown infra profile' }, { status: 400 });
    }

    const { summary, resources } = generatePlan(profileId, sub.envName);

    const costInput: CostEstimateInput = {
      profileId,
      nodeInstanceType: overrides.instance_types[0] ?? 't3a.medium',
      nodeCount: overrides.desired,
      diskSizeGbPerNode: overrides.disk_size,
      natEnabled: overrides.nat_enabled,
      albEnabled: true,
      efsEnabled: overrides.efs_enabled,
      efsSizeGb: overrides.efs_enabled ? 50 : 0,
      vpnEnabled: overrides.vpn_enabled,
    };
    const costEstimate = estimate(costInput);

    const planSnapshot = { summary, resources };
    const costEstimateSnapshot = costEstimate;

    updateSubscription(parsed.data.subscriptionId, {
      planSnapshot,
      costEstimateSnapshot,
    });

    return NextResponse.json({
      plan: planSnapshot,
      costEstimate: costEstimateSnapshot,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
