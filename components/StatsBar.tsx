import { platformStats } from "@/lib/mockData";

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  return num.toLocaleString('en-US');
}

interface StatItemProps {
  value: string;
  label: string;
  highlight?: boolean;
  hasTooltip?: boolean;
}

function StatItem({ value, label, highlight, hasTooltip }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2">
      <div className="flex items-center gap-1">
        <span
          className={`text-lg sm:text-xl font-bold ${
            highlight ? 'text-og-purple' : 'text-gray-900'
          }`}
        >
          {value}
        </span>
        {hasTooltip && (
          <span
            className="relative group cursor-help"
            title="Agents with verified on-chain inference history"
          >
            <svg
              className="w-3.5 h-3.5 text-og-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        )}
      </div>
      <span className="text-xs text-og-text-muted font-medium whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

export default function StatsBar() {
  const stats = platformStats;

  return (
    <section className="max-w-5xl mx-auto px-4 -mt-5 relative z-10">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100">
          <StatItem
            value={formatNumber(stats.verifiedAgents)}
            label="Verified AI Agents"
            highlight
            hasTooltip
          />
          <StatItem
            value={formatNumber(stats.totalRegistered)}
            label="total registered"
          />
          <StatItem
            value={formatNumber(stats.totalModels)}
            label="models"
          />
          <StatItem
            value={formatNumber(stats.totalSpaces)}
            label="spaces"
          />
          <StatItem
            value={formatNumber(stats.totalPosts)}
            label="posts"
          />
          <StatItem
            value={formatNumber(stats.totalInferences)}
            label="inferences"
          />
        </div>
      </div>
    </section>
  );
}
