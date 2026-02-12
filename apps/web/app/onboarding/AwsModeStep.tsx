'use client';

import { useState } from 'react';
import { AWS_MODES } from '@/lib/data';
import type { AwsOnboardingMode } from '@/lib/data';

interface AwsModeStepProps {
  subscriptionId: string;
  onNext: () => void;
  onBack: () => void;
}

export function AwsModeStep({ subscriptionId, onNext, onBack }: AwsModeStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AwsOnboardingMode>('C');
  const [roleArn, setRoleArn] = useState('');
  const [accountId, setAccountId] = useState('');

  const handleNext = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/select-aws-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          awsMode: selected,
          awsRoleArn: selected === 'C' ? roleArn || undefined : undefined,
          awsAccountId: accountId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Failed to save');
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white">AWS onboarding mode</h2>
      <p className="mt-1 text-sm text-slate-400">
        How we will provision into your AWS environment. OIDC (C) is recommended.
      </p>
      <div className="mt-6 space-y-4">
        <div className="grid gap-3">
          {AWS_MODES.map((mode) => (
            <label
              key={mode.id}
              className={`flex cursor-pointer flex-col rounded-lg border p-4 transition ${
                selected === mode.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="awsMode"
                value={mode.id}
                checked={selected === mode.id}
                onChange={() => setSelected(mode.id)}
                className="sr-only"
              />
              <span className="font-medium text-white">Mode {mode.id}: {mode.name}</span>
              <p className="mt-1 text-sm text-slate-400">{mode.description}</p>
            </label>
          ))}
        </div>
        {selected === 'A' && (
          <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4 text-sm text-slate-300">
            <p>Account creation plan: new account via AWS Organizations, baseline guardrails (SCP, CloudTrail, Config), cross-account OfficelessProvisionerRole. Estimated time 5–15 minutes.</p>
          </div>
        )}
        {selected === 'B' && (
          <div className="rounded-lg border border-amber-600/50 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p>Mock only: we do not store real credentials. Required permissions: IAM, EKS, VPC, EC2, EFS, S3, ELB. Prefer Mode C.</p>
          </div>
        )}
        {selected === 'C' && (
          <div className="space-y-3 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
            <p className="text-sm text-slate-300">Provide the IAM Role ARN with trust to our OIDC provider (mock: any format accepted).</p>
            <div>
              <label className="label">Role ARN (optional for mock)</label>
              <input
                className="input mt-1"
                placeholder="arn:aws:iam::123456789012:role/OfficelessProvisionerRole"
                value={roleArn}
                onChange={(e) => setRoleArn(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Account ID (optional)</label>
              <input
                className="input mt-1"
                placeholder="123456789012"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
