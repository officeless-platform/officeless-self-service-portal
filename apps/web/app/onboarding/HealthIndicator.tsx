'use client';

export type HealthStatus = 'green' | 'amber' | 'red';

interface HealthIndicatorProps {
  status: HealthStatus;
  label: string;
  className?: string;
}

const styles: Record<HealthStatus, { dot: string; text: string }> = {
  green: {
    dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    text: 'text-emerald-400',
  },
  amber: {
    dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    text: 'text-amber-400',
  },
  red: {
    dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    text: 'text-red-400',
  },
};

export function HealthIndicator({ status, label, className = '' }: HealthIndicatorProps) {
  const { dot, text } = styles[status];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${dot}`}
        title={status}
        aria-hidden
      />
      <span className={`text-sm font-medium capitalize ${text}`}>{label}</span>
    </div>
  );
}
