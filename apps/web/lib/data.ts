export type PackageId =
  | 'student'
  | 'essentials'
  | 'starter'
  | 'growth'
  | 'pro'
  | 'ultimate'
  | 'enterprise';

export interface ProductPackage {
  id: PackageId;
  name: string;
  monthlyPriceIdr: number | null;
  description: string;
}

export const OFFICELESS_PACKAGES: ProductPackage[] = [
  { id: 'student', name: 'Student', monthlyPriceIdr: 0, description: 'For students and learning' },
  { id: 'essentials', name: 'Essentials', monthlyPriceIdr: 1_500_000, description: 'Essential features' },
  { id: 'starter', name: 'Starter', monthlyPriceIdr: 5_000_000, description: 'Small teams' },
  { id: 'growth', name: 'Growth', monthlyPriceIdr: 15_000_000, description: 'Growing businesses' },
  { id: 'pro', name: 'Pro', monthlyPriceIdr: 50_000_000, description: 'Professional tier' },
  { id: 'ultimate', name: 'Ultimate', monthlyPriceIdr: 150_000_000, description: 'Full capability' },
  { id: 'enterprise', name: 'Enterprise', monthlyPriceIdr: null, description: 'Need assessment' },
];

export type InfraProfileId = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface InfraProfileOption {
  id: InfraProfileId;
  name: string;
  description: string;
  targetPackages: string;
}

export const INFRA_PROFILES: InfraProfileOption[] = [
  { id: 'P0', name: 'P0 — Trial / Sandbox', description: 'Single AZ, 1× t3a.medium, 50GB. Demos, PoC, free trial.', targetPackages: 'Trial' },
  { id: 'P1', name: 'P1 — Essentials', description: '2× t3a.medium, 1 NAT, 2× 50GB. Essentials/Starter.', targetPackages: 'Essentials / Starter' },
  { id: 'P2', name: 'P2 — Starter/Growth', description: '2× t3a.large, 1 NAT, 2× 100GB, optional EFS.', targetPackages: 'Starter / Growth' },
  { id: 'P3', name: 'P3 — Pro', description: '3× t3a.large, 3× 150GB. Optional Valkey.', targetPackages: 'Pro' },
  { id: 'P4', name: 'P4 — Ultimate', description: '4–6× t3a.large, scaled storage. Cap at 6 nodes.', targetPackages: 'Ultimate' },
];

export type AwsOnboardingMode = 'A' | 'B' | 'C';

export const AWS_MODES: { id: AwsOnboardingMode; name: string; description: string }[] = [
  { id: 'A', name: 'New AWS account', description: 'We create a new account via AWS Organizations. Best isolation.' },
  { id: 'B', name: 'Existing account (credentials)', description: 'You provide Access Key/Secret. Not recommended; prefer C.' },
  { id: 'C', name: 'Existing account (OIDC role)', description: 'You create IAM role with trust to our OIDC. Recommended.' },
];

export const AWS_REGIONS = [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-east-2', name: 'US East (Ohio)' },
  { id: 'us-west-1', name: 'US West (N. California)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-west-1', name: 'Europe (Ireland)' },
  { id: 'eu-central-1', name: 'Europe (Frankfurt)' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
  { id: 'ap-southeast-3', name: 'Asia Pacific (Jakarta)' },
  { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)' },
  { id: 'ap-southeast-2', name: 'Asia Pacific (Sydney)' },
] as const;

export type OnboardingStatus = 'draft' | 'pending_approval' | 'approved' | 'provisioning' | 'ready' | 'rejected';

export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_CAP_USD = 1000;
export const MIN_CONTRACT_MONTHS = 6;
