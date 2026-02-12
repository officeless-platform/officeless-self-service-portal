import pricing from './pricing-defaults.json';

const HOURS_PER_MONTH = (pricing as { hours_per_month: number }).hours_per_month;
const MONTHLY_CAP_USD = 1000;

export interface CostEstimateInput {
  profileId: string;
  nodeInstanceType: string;
  nodeCount: number;
  diskSizeGbPerNode: number;
  natEnabled: boolean;
  albEnabled: boolean;
  efsEnabled: boolean;
  efsSizeGb?: number;
  vpnEnabled?: boolean;
  regionMultiplier?: number;
}

export interface CostDriver {
  name: string;
  monthlyUsd: number;
  description?: string;
}

export interface CostEstimateResult {
  fixedMonthlyUsd: number;
  variableMonthlyUsd: number;
  totalLowUsd: number;
  totalHighUsd: number;
  drivers: CostDriver[];
  underCap: boolean;
  capReason?: string;
}

const p = pricing as Record<string, unknown>;
const ec2Rates = p.ec2_hourly_usd as Record<string, number>;

function getEc2Hourly(instanceType: string): number {
  return ec2Rates[instanceType] ?? ec2Rates['t3a.medium'] ?? 0.04;
}

export function estimate(input: CostEstimateInput): CostEstimateResult {
  const mult = input.regionMultiplier ?? 1;
  const drivers: CostDriver[] = [];

  const eksCluster = (p.eks_cluster_hourly_usd as number) * HOURS_PER_MONTH * mult;
  drivers.push({
    name: 'EKS control plane',
    monthlyUsd: Math.round(eksCluster * 100) / 100,
    description: '$0.10/hr × 730 hrs',
  });

  const ec2Hourly = getEc2Hourly(input.nodeInstanceType);
  const ec2Monthly = ec2Hourly * HOURS_PER_MONTH * input.nodeCount * mult;
  drivers.push({
    name: `EC2 (${input.nodeCount}× ${input.nodeInstanceType})`,
    monthlyUsd: Math.round(ec2Monthly * 100) / 100,
  });

  const diskGb = input.diskSizeGbPerNode * input.nodeCount;
  const ebsMonthly = (p.ebs_gp3_per_gb_month_usd as number) * diskGb * mult;
  drivers.push({
    name: `EBS gp3 (${diskGb} GB)`,
    monthlyUsd: Math.round(ebsMonthly * 100) / 100,
  });

  let natMonthly = 0;
  if (input.natEnabled) {
    natMonthly =
      (p.nat_gateway_hourly_usd as number) * HOURS_PER_MONTH +
      (p.nat_data_per_gb_usd as number) * (p.default_nat_data_gb as number);
    drivers.push({
      name: 'NAT Gateway',
      monthlyUsd: Math.round(natMonthly * 100) / 100,
    });
  }

  let albMonthly = 0;
  if (input.albEnabled) {
    albMonthly =
      (p.alb_hourly_usd as number) * HOURS_PER_MONTH +
      (p.alb_lcu_hourly_usd as number) * (p.default_alb_lcu_hours as number) * HOURS_PER_MONTH;
    drivers.push({
      name: 'ALB',
      monthlyUsd: Math.round(albMonthly * 100) / 100,
    });
  }

  let efsMonthly = 0;
  if (input.efsEnabled && (input.efsSizeGb ?? 0) > 0) {
    const efsGb = input.efsSizeGb ?? 50;
    efsMonthly = (p.efs_per_gb_month_usd as number) * efsGb * mult;
    drivers.push({
      name: `EFS (${efsGb} GB)`,
      monthlyUsd: Math.round(efsMonthly * 100) / 100,
    });
  }

  const fixedMonthlyUsd =
    eksCluster + ec2Monthly + ebsMonthly + natMonthly + albMonthly + efsMonthly;
  const variableEstimate = (input.natEnabled ? 20 : 0) + (input.albEnabled ? 15 : 0);
  const variableMonthlyUsd = variableEstimate;
  const totalLowUsd = fixedMonthlyUsd;
  const totalHighUsd = fixedMonthlyUsd + variableMonthlyUsd;

  const underCap = totalHighUsd <= MONTHLY_CAP_USD;
  const capReason = underCap
    ? undefined
    : `Estimate $${Math.round(totalHighUsd)} exceeds $${MONTHLY_CAP_USD} monthly cap. Reduce node count, instance size, or disable optional add-ons.`;

  return {
    fixedMonthlyUsd: Math.round(fixedMonthlyUsd * 100) / 100,
    variableMonthlyUsd: Math.round(variableMonthlyUsd * 100) / 100,
    totalLowUsd: Math.round(totalLowUsd * 100) / 100,
    totalHighUsd: Math.round(totalHighUsd * 100) / 100,
    drivers,
    underCap,
    capReason,
  };
}
