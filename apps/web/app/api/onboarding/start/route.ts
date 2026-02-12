import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCompany, createSubscription } from '@/lib/store';

const bodySchema = z.object({
  legalName: z.string().min(1),
  registrationNumber: z.string().min(1),
  address: z.string().min(1),
  billingContact: z.string().min(1),
  technicalContact: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const company = await createCompany({
      ...parsed.data,
      verificationStatus: 'pending',
    });
    const subscription = await createSubscription({
      companyId: company.id,
      packageId: 'essentials',
      addOns: [],
      contractMonths: 6,
      status: 'draft',
      infraProfileId: 'P1',
      awsMode: 'C',
      envName: `env-${company.id.replace('co-', '')}`,
    });
    return NextResponse.json({
      companyId: company.id,
      subscriptionId: subscription.id,
      company,
      subscription,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 });
  }
}
