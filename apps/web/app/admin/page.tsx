'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SubWithCompany {
  id: string;
  companyId: string;
  packageId: string;
  status: string;
  infraProfileId: string;
  awsMode: string;
  envName: string;
  updatedAt?: string;
  paused?: boolean;
  destroyed?: boolean;
  company: { legalName: string; verificationStatus: string } | null;
}

function statusColor(status: string, paused?: boolean, destroyed?: boolean): string {
  if (destroyed) return 'text-red-400';
  if (paused) return 'text-amber-400';
  switch (status) {
    case 'ready': return 'text-emerald-400';
    case 'rejected': return 'text-red-400';
    case 'pending_approval': return 'text-amber-400';
    case 'provisioning': return 'text-sky-400';
    case 'approved': return 'text-slate-300';
    case 'draft': return 'text-slate-500';
    default: return 'text-slate-400';
  }
}

function formatTimestamp(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const [subscriptions, setSubscriptions] = useState<SubWithCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err?.error === 'string' ? err.error : err?.message || `Failed to load (${res.status})`;
        setError(msg);
        setSubscriptions([]);
        return;
      }
      const data = await res.json();
      setSubscriptions(data.subscriptions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load customers');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700/60 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="text-xl font-semibold text-white">
            Officeless Portal — Admin
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Customers</h1>
            <p className="mt-1 text-slate-400">
              Approve onboarding, pause infra, backup DB, or destroy.
            </p>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={loadSubscriptions}
              className="shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
            >
              Refresh
            </button>
          )}
        </div>
        {error && (
          <p className="mt-4 text-sm text-amber-400">{error}</p>
        )}
        {loading ? (
          <p className="mt-8 text-slate-400">Loading…</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="pb-3 font-medium text-slate-300">Subscription ID</th>
                  <th className="pb-3 font-medium text-slate-300">Company</th>
                  <th className="pb-3 font-medium text-slate-300">Package</th>
                  <th className="pb-3 font-medium text-slate-300">Infra</th>
                  <th className="pb-3 font-medium text-slate-300">Status</th>
                  <th className="pb-3 font-medium text-slate-300">Last updated</th>
                  <th className="pb-3 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No subscriptions yet. Use Customer onboarding to create one.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-700/60">
                      <td className="py-4 font-mono text-sm text-slate-300">
                        {sub.id}
                      </td>
                      <td className="py-4 text-white">
                        {sub.company?.legalName ?? sub.companyId}
                      </td>
                      <td className="py-4 text-slate-300">{sub.packageId}</td>
                      <td className="py-4 text-slate-300">{sub.infraProfileId}</td>
                      <td className="py-4">
                        <span className={statusColor(sub.status, sub.paused, sub.destroyed)}>
                          {sub.status}
                          {sub.paused && ' (Paused)'}
                          {sub.destroyed && ' (Destroyed)'}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">
                        {formatTimestamp(sub.updatedAt)}
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/admin/customers/${sub.id}`}
                          className="text-emerald-400 hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
