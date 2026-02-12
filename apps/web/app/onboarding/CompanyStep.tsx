'use client';

import { useState } from 'react';

interface CompanyStepProps {
  onSuccess: (companyId: string, subscriptionId: string) => void;
}

export function CompanyStep({ onSuccess }: CompanyStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    legalName: '',
    registrationNumber: '',
    address: '',
    billingContact: '',
    technicalContact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? 'Failed to start');
      onSuccess(data.companyId, data.subscriptionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white">Company & contacts</h2>
      <p className="mt-1 text-sm text-slate-400">
        B2B verification status will be set to Pending until approved.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Legal company name</label>
          <input
            className="input mt-1"
            value={form.legalName}
            onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Registration number (ABN / NPWP)</label>
          <input
            className="input mt-1"
            value={form.registrationNumber}
            onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea
            className="input mt-1 min-h-[80px]"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Billing contact</label>
          <input
            className="input mt-1"
            value={form.billingContact}
            onChange={(e) => setForm((f) => ({ ...f, billingContact: e.target.value }))}
            placeholder="Email or name"
            required
          />
        </div>
        <div>
          <label className="label">Technical contact</label>
          <input
            className="input mt-1"
            value={form.technicalContact}
            onChange={(e) => setForm((f) => ({ ...f, technicalContact: e.target.value }))}
            placeholder="Email or name"
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Starting…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
