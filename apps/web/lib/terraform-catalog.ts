import catalog from './terraform-catalog.json';
import type { InfraProfileId } from './data';

interface TerraformCatalog {
  modules: Record<string, { resources: string[] }>;
}

export interface InfraProfileOverrides {
  instance_types: string[];
  desired: number;
  min: number;
  max: number;
  disk_size: number;
  nat_enabled: boolean;
  efs_enabled: boolean;
  vpn_enabled: boolean;
}

export const INFRA_PROFILE_OVERRIDES: Record<InfraProfileId, InfraProfileOverrides> = {
  P0: {
    instance_types: ['t3a.medium'],
    desired: 1,
    min: 1,
    max: 2,
    disk_size: 50,
    nat_enabled: false,
    efs_enabled: false,
    vpn_enabled: false,
  },
  P1: {
    instance_types: ['t3a.medium'],
    desired: 2,
    min: 2,
    max: 4,
    disk_size: 50,
    nat_enabled: true,
    efs_enabled: false,
    vpn_enabled: false,
  },
  P2: {
    instance_types: ['t3a.large'],
    desired: 2,
    min: 2,
    max: 4,
    disk_size: 100,
    nat_enabled: true,
    efs_enabled: true,
    vpn_enabled: false,
  },
  P3: {
    instance_types: ['t3a.large'],
    desired: 3,
    min: 3,
    max: 6,
    disk_size: 150,
    nat_enabled: true,
    efs_enabled: true,
    vpn_enabled: false,
  },
  P4: {
    instance_types: ['t3a.large'],
    desired: 4,
    min: 4,
    max: 6,
    disk_size: 150,
    nat_enabled: true,
    efs_enabled: true,
    vpn_enabled: false,
  },
};

export function getCatalog(): TerraformCatalog {
  return catalog as TerraformCatalog;
}

export interface PlannedResource {
  module: string;
  type: string;
}

export interface PlanSummary {
  totalResources: number;
  byModule: Record<string, number>;
  variableOverrides: Record<string, unknown>;
  outputs: Record<string, string>;
}

export function generatePlan(profileId: InfraProfileId, envName: string): {
  summary: PlanSummary;
  resources: PlannedResource[];
} {
  const catalogData = getCatalog();
  const overrides = INFRA_PROFILE_OVERRIDES[profileId];
  if (!overrides) throw new Error(`Unknown profile: ${profileId}`);

  const resources: PlannedResource[] = [];
  for (const [moduleName, module] of Object.entries(catalogData.modules)) {
    if (moduleName === 'vpn_optional' && !overrides.vpn_enabled) continue;
    for (const type of module.resources) {
      resources.push({ module: moduleName, type });
    }
  }

  const byModule: Record<string, number> = {};
  for (const r of resources) {
    byModule[r.module] = (byModule[r.module] ?? 0) + 1;
  }

  const summary: PlanSummary = {
    totalResources: resources.length,
    byModule,
    variableOverrides: {
      eks_node_instance_types: overrides.instance_types,
      eks_node_desired: overrides.desired,
      eks_node_min: overrides.min,
      eks_node_max: overrides.max,
      eks_node_disk_size: overrides.disk_size,
      nat_enabled: overrides.nat_enabled,
      efs_enabled: overrides.efs_enabled,
      vpn_enabled: overrides.vpn_enabled,
    },
    outputs: {
      cluster_name: `officeless-${envName}-cluster`,
      cluster_region: 'ap-southeast-1',
      cluster_endpoint: `https://mock-${envName}.eks.ap-southeast-1.amazonaws.com`,
    },
  };

  return { summary, resources };
}
