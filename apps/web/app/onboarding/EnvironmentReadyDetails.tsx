'use client';

import { HealthIndicator, type HealthStatus } from './HealthIndicator';

interface Endpoints {
  dashboardUrl: string;
  apiEndpoint: string;
  awsConsoleUrl: string;
  awsAccountId?: string;
  region?: string;
}

interface EnvironmentReadyDetailsProps {
  envName: string;
  endpoints: Endpoints;
  companyName?: string;
  paused?: boolean;
  destroyed?: boolean;
  statusHealth?: HealthStatus;
  apiHealth?: HealthStatus;
}

const healthLabel: Record<HealthStatus, string> = {
  green: 'Healthy',
  amber: 'Degraded',
  red: 'Down',
};

export function EnvironmentReadyDetails({
  envName,
  endpoints,
  companyName,
  paused,
  destroyed,
  statusHealth = 'green',
  apiHealth = 'green',
}: EnvironmentReadyDetailsProps) {
  const accessItems = [
    {
      label: 'Status & dashboard',
      value: endpoints.dashboardUrl,
      href: endpoints.dashboardUrl,
      description: 'View onboarding status and environment dashboard',
    },
    {
      label: 'API endpoint',
      value: endpoints.apiEndpoint,
      href: endpoints.apiEndpoint,
      description: 'Base URL for your environment API',
      health: apiHealth,
    },
    {
      label: 'AWS Console',
      value: endpoints.awsConsoleUrl,
      href: endpoints.awsConsoleUrl,
      description: endpoints.awsAccountId
        ? `Sign in to AWS account ${endpoints.awsAccountId}`
        : 'Open AWS Management Console',
    },
  ];

  const borderColor = destroyed
    ? 'border-red-500/40'
    : paused
      ? 'border-amber-500/40'
      : 'border-emerald-500/30';
  const iconBg = destroyed
    ? 'bg-red-500/20 text-red-400'
    : paused
      ? 'bg-amber-500/20 text-amber-400'
      : 'bg-emerald-500/20 text-emerald-400';

  return (
    <div className={`rounded-xl border ${borderColor} bg-slate-800/50 p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
            {destroyed ? '✕' : paused ? '⏸' : '✓'}
          </span>
          <h3 className="text-lg font-semibold text-white">
            {destroyed ? 'Environment destroyed' : paused ? 'Environment paused' : 'Environment ready'}
          </h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <HealthIndicator status={statusHealth} label={`Status: ${healthLabel[statusHealth]}`} />
          <HealthIndicator status={apiHealth} label={`API: ${healthLabel[apiHealth]}`} />
        </div>
      </div>
      {companyName && (
        <p className="mt-1 text-sm text-slate-400">{companyName} · {envName}</p>
      )}
      <p className="mt-3 text-sm text-slate-300">
        {destroyed
          ? 'This environment has been destroyed by admin. No further access.'
          : paused
            ? 'Infrastructure is paused (scale to 0). Database retained. Contact admin to unpause.'
            : 'Your infrastructure has been created. Use the links below to access your environment and AWS resources.'}
      </p>
      <ul className="mt-4 space-y-4">
        {accessItems.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-slate-600 bg-slate-900/50 p-4"
          >
            <span className="block text-sm font-medium text-slate-300">
              {item.label}
            </span>
            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
            {'health' in item && (
              <div className="mt-2">
                <HealthIndicator status={item.health as HealthStatus} label={healthLabel[item.health as HealthStatus]} />
              </div>
            )}
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-sm text-emerald-400 hover:underline"
            >
              {item.value}
            </a>
          </li>
        ))}
      </ul>
      {endpoints.region && (
        <p className="mt-4 text-xs text-slate-500">
          Region: {endpoints.region}
          {endpoints.awsAccountId && ` · Account: ${endpoints.awsAccountId}`}
        </p>
      )}
    </div>
  );
}
