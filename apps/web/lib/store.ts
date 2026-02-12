/**
 * Portal data store. Uses Vercel KV (Upstash Redis) when
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set; otherwise in-memory (e.g. local dev).
 */

import { kv } from './kv';
import type { PackageId, InfraProfileId, AwsOnboardingMode } from './data';

const KEY_COMPANIES_IDS = 'companies:ids';
const KEY_COMPANY = (id: string) => `company:${id}`;
const KEY_SUBSCRIPTIONS_IDS = 'subscriptions:ids';
const KEY_SUBSCRIPTION = (id: string) => `subscription:${id}`;
const KEY_ACTIONS_IDS = 'admin_actions:ids';
const KEY_ACTION = (id: string) => `admin_action:${id}`;
const KEY_TAC_IDS = 'tac:ids';
const KEY_TAC = (id: string) => `tac:${id}`;
const KEY_COUNTER_SUB = 'counter:subId';
const KEY_COUNTER_COMPANY = 'counter:companyId';
const KEY_COUNTER_ACTION = 'counter:actionId';
const KEY_COUNTER_TAC = 'counter:tacId';

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Company {
  id: string;
  legalName: string;
  registrationNumber: string;
  address: string;
  billingContact: ContactInfo;
  technicalContact: ContactInfo;
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
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  envName: string;
  planSnapshot?: unknown;
  costEstimateSnapshot?: unknown;
  /** Set when the one-time provisioning animation has been shown (ISO date). */
  initialSetupShownAt?: string;
  /** Filled when status becomes ready (endpoints and access). */
  endpoints?: {
    dashboardUrl: string;
    apiEndpoint: string;
    awsConsoleUrl: string;
    awsAccountId?: string;
    region?: string;
  };
  /** True when admin has paused infrastructure (scale to 0, retain DB). */
  paused?: boolean;
  /** True when admin has destroyed the environment; no further actions allowed. */
  destroyed?: boolean;
  /** Last backup result (S3 location and time). */
  lastBackup?: { s3Location: string; completedAt: string };
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

// In-memory fallback when KV env is not set
const companies = new Map<string, Company>();
const subscriptions = new Map<string, Subscription>();
const adminActions = new Map<string, AdminAction>();
const tacAcceptances = new Map<string, TacAcceptance>();
let subIdCounter = 1;
let companyIdCounter = 1;
let actionIdCounter = 1;
let tacIdCounter = 1;

export async function createCompany(data: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
  if (kv) {
    const idNum = await kv.incr(KEY_COUNTER_COMPANY);
    const id = `co-${idNum}`;
    const company: Company = { ...data, id, createdAt: new Date().toISOString() };
    await kv.set(KEY_COMPANY(id), company);
    await kv.sadd(KEY_COMPANIES_IDS, id);
    return company;
  }
  const id = `co-${companyIdCounter++}`;
  const company: Company = { ...data, id, createdAt: new Date().toISOString() };
  companies.set(id, company);
  return company;
}

export async function getCompany(id: string): Promise<Company | undefined> {
  if (kv) return (await kv.get<Company>(KEY_COMPANY(id))) ?? undefined;
  return companies.get(id);
}

export async function createSubscription(
  data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
  const now = new Date().toISOString();
  if (kv) {
    const idNum = await kv.incr(KEY_COUNTER_SUB);
    const id = `sub-${idNum}`;
    const sub: Subscription = { ...data, id, createdAt: now, updatedAt: now };
    await kv.set(KEY_SUBSCRIPTION(id), sub);
    await kv.sadd(KEY_SUBSCRIPTIONS_IDS, id);
    return sub;
  }
  const id = `sub-${subIdCounter++}`;
  const sub: Subscription = { ...data, id, createdAt: now, updatedAt: now };
  subscriptions.set(id, sub);
  return sub;
}

export async function getSubscription(id: string): Promise<Subscription | undefined> {
  if (kv) return (await kv.get<Subscription>(KEY_SUBSCRIPTION(id))) ?? undefined;
  return subscriptions.get(id);
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<Subscription | undefined> {
  const sub = await getSubscription(id);
  if (!sub) return undefined;
  const updated = { ...sub, ...updates, updatedAt: new Date().toISOString() };
  if (kv) {
    await kv.set(KEY_SUBSCRIPTION(id), updated);
    return updated;
  }
  subscriptions.set(id, updated);
  return updated;
}

export async function listSubscriptions(): Promise<Subscription[]> {
  if (kv) {
    const ids = await kv.smembers(KEY_SUBSCRIPTIONS_IDS);
    const list = await Promise.all(ids.map((id) => kv!.get<Subscription>(KEY_SUBSCRIPTION(id))));
    return (list.filter(Boolean) as Subscription[]).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return Array.from(subscriptions.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function listCompanies(): Promise<Company[]> {
  if (kv) {
    const ids = await kv.smembers(KEY_COMPANIES_IDS);
    const list = await Promise.all(ids.map((id) => kv!.get<Company>(KEY_COMPANY(id))));
    return list.filter(Boolean) as Company[];
  }
  return Array.from(companies.values());
}

export async function createAdminAction(
  data: Omit<AdminAction, 'id' | 'requestedAt'>
): Promise<AdminAction> {
  const id = kv ? `act-${await kv.incr(KEY_COUNTER_ACTION)}` : `act-${actionIdCounter++}`;
  const action: AdminAction = { ...data, id, requestedAt: new Date().toISOString() };
  if (kv) {
    await kv.set(KEY_ACTION(id), action);
    await kv.sadd(KEY_ACTIONS_IDS, id);
    return action;
  }
  adminActions.set(id, action);
  return action;
}

export async function updateAdminAction(
  id: string,
  updates: Partial<AdminAction>
): Promise<AdminAction | undefined> {
  const action = kv ? await kv.get<AdminAction>(KEY_ACTION(id)) : adminActions.get(id);
  if (!action) return undefined;
  const updated = { ...action, ...updates };
  if (kv) {
    await kv.set(KEY_ACTION(id), updated);
    return updated;
  }
  adminActions.set(id, updated);
  return updated;
}

export async function listAdminActions(subscriptionId?: string): Promise<AdminAction[]> {
  if (kv) {
    const ids = await kv.smembers(KEY_ACTIONS_IDS);
    const list = await Promise.all(ids.map((id) => kv!.get<AdminAction>(KEY_ACTION(id))));
    let actions = list.filter(Boolean) as AdminAction[];
    if (subscriptionId) actions = actions.filter((a) => a.subscriptionId === subscriptionId);
    return actions.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }
  let list = Array.from(adminActions.values());
  if (subscriptionId) list = list.filter((a) => a.subscriptionId === subscriptionId);
  return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export async function recordTacAcceptance(
  data: Omit<TacAcceptance, 'id' | 'acceptedAt'>
): Promise<TacAcceptance> {
  const id = kv ? `tac-${await kv.incr(KEY_COUNTER_TAC)}` : `tac-${tacIdCounter++}`;
  const tac: TacAcceptance = { ...data, id, acceptedAt: new Date().toISOString() };
  if (kv) {
    await kv.set(KEY_TAC(id), tac);
    await kv.sadd(KEY_TAC_IDS, id);
    return tac;
  }
  tacAcceptances.set(id, tac);
  return tac;
}
