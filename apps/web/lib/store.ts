/**
 * In-memory store for portal data (mock). Replace with Vercel Postgres / Supabase in production.
 */

import type { PackageId, InfraProfileId, AwsOnboardingMode } from './data';

export interface Company {
  id: string;
  legalName: string;
  registrationNumber: string;
  address: string;
  billingContact: string;
  technicalContact: string;
  verificationStatus: 'pending' | 'approved';
  createdAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  packageId: PackageId;
  addOns: string[];
  contractMonths: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'provisioning' | 'ready' | 'rejected';
  infraProfileId: InfraProfileId;
  awsMode: AwsOnboardingMode;
  awsRoleArn?: string;
  awsAccountId?: string;
  envName: string;
  planSnapshot?: unknown;
  costEstimateSnapshot?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAction {
  id: string;
  subscriptionId: string;
  action: 'pause' | 'backup' | 'destroy';
  status: 'pending' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  details?: unknown;
}

export interface TacAcceptance {
  id: string;
  userId: string;
  subscriptionId: string;
  termsVersion: string;
  acceptedAt: string;
  ipHash?: string;
}

const companies = new Map<string, Company>();
const subscriptions = new Map<string, Subscription>();
const adminActions = new Map<string, AdminAction>();
const tacAcceptances = new Map<string, TacAcceptance>();

let subIdCounter = 1;
let companyIdCounter = 1;
let actionIdCounter = 1;
let tacIdCounter = 1;

export function createCompany(data: Omit<Company, 'id' | 'createdAt'>): Company {
  const id = `co-${companyIdCounter++}`;
  const company: Company = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  companies.set(id, company);
  return company;
}

export function getCompany(id: string): Company | undefined {
  return companies.get(id);
}

export function createSubscription(data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Subscription {
  const id = `sub-${subIdCounter++}`;
  const now = new Date().toISOString();
  const sub: Subscription = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };
  subscriptions.set(id, sub);
  return sub;
}

export function getSubscription(id: string): Subscription | undefined {
  return subscriptions.get(id);
}

export function updateSubscription(id: string, updates: Partial<Subscription>): Subscription | undefined {
  const sub = subscriptions.get(id);
  if (!sub) return undefined;
  const updated = { ...sub, ...updates, updatedAt: new Date().toISOString() };
  subscriptions.set(id, updated);
  return updated;
}

export function listSubscriptions(): Subscription[] {
  return Array.from(subscriptions.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function listCompanies(): Company[] {
  return Array.from(companies.values());
}

export function createAdminAction(data: Omit<AdminAction, 'id' | 'requestedAt'>): AdminAction {
  const id = `act-${actionIdCounter++}`;
  const action: AdminAction = {
    ...data,
    id,
    requestedAt: new Date().toISOString(),
  };
  adminActions.set(id, action);
  return action;
}

export function updateAdminAction(id: string, updates: Partial<AdminAction>): AdminAction | undefined {
  const action = adminActions.get(id);
  if (!action) return undefined;
  const updated = { ...action, ...updates };
  adminActions.set(id, updated);
  return updated;
}

export function listAdminActions(subscriptionId?: string): AdminAction[] {
  const list = Array.from(adminActions.values());
  if (subscriptionId) return list.filter((a) => a.subscriptionId === subscriptionId);
  return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export function recordTacAcceptance(data: Omit<TacAcceptance, 'id' | 'acceptedAt'>): TacAcceptance {
  const id = `tac-${tacIdCounter++}`;
  const tac: TacAcceptance = {
    ...data,
    id,
    acceptedAt: new Date().toISOString(),
  };
  tacAcceptances.set(id, tac);
  return tac;
}
