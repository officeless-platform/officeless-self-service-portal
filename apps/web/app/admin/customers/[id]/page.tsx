'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { EnvironmentReadyDetails } from '@/app/onboarding/EnvironmentReadyDetails';
import {
  AdminActionProgressModal,
  type ProgressStep,
} from '@/app/admin/customers/AdminActionProgressModal';

interface Sub {
  id: string;
  companyId: string;
  packageId: string;
  status: string;
  infraProfileId: string;
  awsMode: string;
  envName: string;
  paused?: boolean;
  destroyed?: boolean;
  lastBackup?: { s3Location: string; completedAt: string };
  endpoints?: {
    dashboardUrl: string;
    apiEndpoint: string;
    awsConsoleUrl: string;
    awsAccountId?: string;
    region?: string;
  };
}
interface Company {
  legalName: string;
  verificationStatus: string;
}
interface Action {
  id: string;
  action: string;
  status: string;
  requestedAt: string;
  details?: unknown;
}

export default function AdminCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const [sub, setSub] = useState<Sub | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [destroyLoading, setDestroyLoading] = useState(false);
  const [destroyConfirm, setDestroyConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalStep, setModalStep] = useState<ProgressStep>('submitting');
  const [modalStepLabels, setModalStepLabels] = useState<[string, string, string] | undefined>(undefined);
  const [modalResultDetail, setModalResultDetail] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAbortedRef = useRef(false);

  const openProgressModal = (title: string, stepLabels?: [string, string, string]) => {
    setModalError(null);
    setModalResultDetail(null);
    setModalTitle(title);
    setModalStepLabels(stepLabels);
    setModalStep('submitting');
    setModalOpen(true);
    progressAbortedRef.current = false;
  };

  const setProgressStep = (step: ProgressStep, err?: string | null) => {
    setModalStep(step);
    if (err != null) setModalError(err);
  };

  const closeModal = () => {
    progressAbortedRef.current = true;
    setModalOpen(false);
    setModalResultDetail(null);
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
      progressTimeoutRef.current = null;
    }
  };

  const runWithProgress = async (
    title: string,
    options: { stepLabels?: [string, string, string] },
    fn: (setResultDetail: (s: string) => void) => Promise<void>
  ) => {
    openProgressModal(title, options.stepLabels);
    progressTimeoutRef.current = setTimeout(() => {
      if (!progressAbortedRef.current) setModalStep('processing');
      progressTimeoutRef.current = null;
    }, 400);
    try {
      await fn((detail) => setModalResultDetail(detail));
      if (progressAbortedRef.current) return;
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
        progressTimeoutRef.current = null;
      }
      setProgressStep('succeeded');
      progressTimeoutRef.current = setTimeout(closeModal, 2000);
    } catch (e) {
      if (progressAbortedRef.current) return;
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
        progressTimeoutRef.current = null;
      }
      setProgressStep('failed', e instanceof Error ? e.message : 'Action failed.');
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSub(data.subscription);
        setCompany(data.company);
      }
      setLoading(false);
    })();
  }, [id]);

  const refreshSubscription = async () => {
    const res = await fetch(`/api/subscriptions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSub(data.subscription);
      setCompany(data.company);
    }
  };

  const refreshActions = async () => {
    const res = await fetch(`/api/admin/actions?subscriptionId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setActions(data.actions ?? []);
    }
  };

  useEffect(() => {
    if (!id) return;
    refreshActions();
  }, [id]);

  const handleApprove = async (approved: boolean) => {
    setError(null);
    setApproveLoading(true);
    await runWithProgress(
      approved ? 'Approving' : 'Rejecting',
      {
        stepLabels: ['Submitting…', 'Updating subscription…', 'Done'],
      },
      async () => {
        const res = await fetch('/api/admin/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: id, approved }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed');
        }
        const data = await res.json();
        setSub(data);
        await refreshActions();
      }
    );
    setApproveLoading(false);
  };

  const handlePause = async () => {
    setError(null);
    setPauseLoading(true);
    const unpause = !!sub?.paused;
    await runWithProgress(
      unpause ? 'Unpausing infrastructure' : 'Pausing infrastructure',
      {
        stepLabels: unpause
          ? ['Scaling node group up…', 'Verifying services…', 'Done']
          : ['Scaling node group to 0…', 'Retaining database…', 'Done'],
      },
      async () => {
        const res = await fetch('/api/admin/pause', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: id, unpause }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed');
        }
        const data = await res.json();
        setSub(data.subscription);
        await refreshActions();
      }
    );
    setPauseLoading(false);
  };

  const handleBackup = async () => {
    setError(null);
    setBackupLoading(true);
    await runWithProgress(
      'Backup DB to S3',
      {
        stepLabels: ['Creating snapshot…', 'Uploading to S3…', 'Done'],
      },
      async (setResultDetail) => {
        const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed');
        }
        const data = await res.json();
        setSub(data.subscription);
        await refreshActions();
        if (data.s3Location) setResultDetail(data.s3Location);
      }
    );
    setBackupLoading(false);
  };

  const handleDestroy = async () => {
    if (destroyConfirm !== company?.legalName) {
      setError('Type the company name exactly to confirm.');
      return;
    }
    setError(null);
    setDestroyLoading(true);
    await runWithProgress(
      'Destroy all',
      {
        stepLabels: ['Tearing down VPC & networking…', 'Removing EKS, EFS, S3…', 'Revoking IAM…'],
      },
      async () => {
        const res = await fetch('/api/admin/destroy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId: id,
            confirmCompanyName: destroyConfirm,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(typeof data?.error === 'string' ? data.error : 'Failed');
        }
        const data = await res.json();
        setSub(data.subscription);
        await refreshActions();
        setDestroyConfirm('');
      }
    );
    setDestroyLoading(false);
  };

  if (loading || !sub) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700/60 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/admin" className="text-xl font-semibold text-white">
            ← Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-white">{company?.legalName ?? sub.companyId}</h1>
          <p className="mt-1 text-slate-400">
            {sub.packageId} · {sub.infraProfileId} · {sub.awsMode} · {sub.envName}
          </p>
          <p className="mt-2">
            Status: <span className="font-medium text-white">{sub.status}</span>
            {sub.paused && <span className="ml-2 text-amber-400">(Paused)</span>}
            {sub.destroyed && <span className="ml-2 text-red-400">(Destroyed)</span>}
          </p>

          {sub.status === 'provisioning' && (
            <p className="mt-4 text-sm text-slate-400">
              Customer will see the one-time infrastructure progress when they open their status page.
            </p>
          )}

          {sub.status === 'ready' && sub.endpoints && (
            <section className="mt-6">
              <h2 className="font-medium text-slate-200">Customer access & endpoints</h2>
              <div className="mt-3">
                <EnvironmentReadyDetails
                  envName={sub.envName}
                  endpoints={sub.endpoints}
                  companyName={company?.legalName}
                  paused={sub.paused}
                  destroyed={sub.destroyed}
                  statusHealth={sub.destroyed ? 'red' : sub.paused ? 'amber' : 'green'}
                  apiHealth={sub.destroyed ? 'red' : sub.paused ? 'amber' : 'green'}
                />
              </div>
            </section>
          )}

          {sub.status === 'pending_approval' && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleApprove(true)}
                disabled={approveLoading}
                className="btn-primary"
              >
                {approveLoading ? '…' : 'Approve'}
              </button>
              <button
                onClick={() => handleApprove(false)}
                disabled={approveLoading}
                className="btn-secondary"
              >
                Reject
              </button>
            </div>
          )}

          {sub.destroyed && (
            <div className="mt-6 rounded-lg border border-red-600/50 bg-red-500/10 p-4 text-sm text-red-200">
              Environment destroyed. No further actions available.
            </div>
          )}

          <section className="mt-8">
            <h2 className="font-medium text-slate-200">Admin actions</h2>
            {sub.lastBackup && (
              <p className="mt-2 text-xs text-slate-500">
                Last backup: <span className="font-mono text-slate-400">{sub.lastBackup.s3Location}</span>
                {' '}({new Date(sub.lastBackup.completedAt).toLocaleString()})
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handlePause}
                disabled={pauseLoading || sub.destroyed}
                className="btn-secondary"
              >
                {pauseLoading ? '…' : sub.paused ? 'Unpause infrastructure' : 'Pause infrastructure (retain DB)'}
              </button>
              <button
                onClick={handleBackup}
                disabled={backupLoading || sub.destroyed}
                className="btn-secondary"
              >
                {backupLoading ? '…' : 'Backup DB to S3'}
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-400">Destroy: type company name to confirm.</p>
              <input
                className="input mt-2 max-w-xs"
                placeholder="Company legal name"
                value={destroyConfirm}
                onChange={(e) => setDestroyConfirm(e.target.value)}
              />
              <button
                onClick={handleDestroy}
                disabled={destroyLoading || sub.destroyed || destroyConfirm !== company?.legalName}
                className="btn-primary ml-2 mt-2 bg-red-600 hover:bg-red-500"
              >
                {destroyLoading ? '…' : 'Destroy all'}
              </button>
            </div>
          </section>

          {actions.length > 0 && (
            <section className="mt-8">
              <h2 className="font-medium text-slate-200">Recent actions</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-400">
                {actions
                  .filter((a) => a.status !== 'pending')
                  .map((a) => (
                    <li key={a.id}>
                      {a.action} — <span className={a.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}>{a.status}</span> — {new Date(a.requestedAt).toLocaleString()}
                      {a.details && typeof a.details === 'object' && 'description' in a.details
                        ? (
                            <span className="ml-2 text-slate-500">
                              ({String((a.details as { description: string }).description)})
                            </span>
                          )
                        : null}
                      {a.details && typeof a.details === 'object' && 's3Location' in a.details && (
                        <span className="ml-2 block font-mono text-xs text-slate-500">
                          {(a.details as { s3Location: string }).s3Location}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </main>

      <AdminActionProgressModal
        open={modalOpen}
        title={modalTitle}
        step={modalStep}
        stepLabels={modalStepLabels}
        resultDetail={modalResultDetail}
        error={modalError}
        onClose={closeModal}
      />
    </div>
  );
}
