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
  company: { legalName: string; verificationStatus: string } | null;
}

export default function AdminPage() {
  const [subscriptions, setSubscriptions] = useState<SubWithCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions ?? []);
      }
      setLoading(false);
    })();
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
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <p className="mt-1 text-slate-400">
          Approve onboarding, pause infra, backup DB, or destroy. All actions are mock.
        </p>
        {loading ? (
          <p className="mt-8 text-slate-400">Loading…</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="pb-3 font-medium text-slate-300">Company</th>
                  <th className="pb-3 font-medium text-slate-300">Package</th>
                  <th className="pb-3 font-medium text-slate-300">Infra</th>
                  <th className="pb-3 font-medium text-slate-300">Status</th>
                  <th className="pb-3 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No subscriptions yet. Use Customer onboarding to create one.
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-700/60">
                      <td className="py-4 text-white">
                        {sub.company?.legalName ?? sub.companyId}
                      </td>
                      <td className="py-4 text-slate-300">{sub.packageId}</td>
                      <td className="py-4 text-slate-300">{sub.infraProfileId}</td>
                      <td className="py-4">
                        <span
                          className={
                            sub.status === 'pending_approval'
                              ? 'text-amber-400'
                              : sub.status === 'ready'
                                ? 'text-emerald-400'
                                : sub.status === 'rejected'
                                  ? 'text-red-400'
                                  : 'text-slate-400'
                          }
                        >
                          {sub.status}
                        </span>
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
