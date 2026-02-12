'use client';

export type ProgressStep = 'submitting' | 'processing' | 'succeeded' | 'failed';

interface AdminActionProgressModalProps {
  open: boolean;
  title: string;
  step: ProgressStep;
  error?: string | null;
  onClose: () => void;
}

export function AdminActionProgressModal({
  open,
  title,
  step,
  error,
  onClose,
}: AdminActionProgressModalProps) {
  if (!open) return null;

  const steps: { key: ProgressStep; label: string }[] = [
    { key: 'submitting', label: 'Submitting request…' },
    { key: 'processing', label: 'Processing…' },
    { key: 'succeeded', label: 'Succeeded' },
    { key: 'failed', label: 'Failed' },
  ];

  const isDone = step === 'succeeded' || step === 'failed';
  const doneSuccess = step === 'succeeded';

  const stepState = (key: ProgressStep) => {
    if (key === 'submitting') return { active: true, check: step !== 'submitting' };
    if (key === 'processing') return { active: step !== 'submitting', check: step === 'processing' || doneSuccess || step === 'failed' };
    if (key === 'succeeded') return { active: doneSuccess, check: doneSuccess };
    return { active: step === 'failed', check: false };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ul className="mt-4 space-y-2">
          {steps.map((s, i) => {
            const isSuccess = s.key === 'succeeded' && step === 'succeeded';
            const isFail = s.key === 'failed' && step === 'failed';
            const { active, check } = stepState(s.key);
            return (
              <li
                key={s.key}
                className={`flex items-center gap-2 text-sm ${
                  active ? 'text-slate-200' : 'text-slate-500'
                } ${step === s.key ? 'font-medium' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    isSuccess
                      ? 'bg-emerald-500 text-white'
                      : isFail
                        ? 'bg-red-500 text-white'
                        : active
                          ? 'bg-slate-600 text-slate-300'
                          : 'bg-slate-700 text-slate-500'
                  }`}
                >
                  {isSuccess ? '✓' : isFail ? '✕' : check ? '✓' : i + 1}
                </span>
                {s.label}
              </li>
            );
          })}
        </ul>
        {error && step === 'failed' && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-500"
          >
            {isDone ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
