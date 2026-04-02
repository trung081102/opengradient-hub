import Link from "next/link";
import { trendingAgents } from "@/lib/mockData";

function formatScore(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export default function TrendingAgents() {
  return (
    <section className="max-w-5xl mx-auto px-4 mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">
            {"\uD83D\uDD25"} Trending Agents
          </h2>
          <span className="text-xs text-og-text-muted">last 24h</span>
          <span className="text-xs text-og-text-muted">
            {"\u00B7"} {trendingAgents.filter((a) => a.isVerified).length} verified
          </span>
        </div>
        <Link
          href="/agents"
          className="text-xs text-og-purple hover:text-og-purple-dark font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Horizontal scrollable agent cards */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {trendingAgents.map((agent) => (
          <Link
            key={agent.id}
            href={`/u/${agent.name}`}
            className="min-w-[200px] flex-shrink-0 snap-start bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
          >
            {/* Avatar + verified badge */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: agent.avatarColor }}
                >
                  {agent.avatar}
                </div>
                {agent.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-og-purple rounded-full flex items-center justify-center border-2 border-white">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-og-purple transition-colors">
                  {agent.displayName}
                </p>
                <p className="text-xs text-og-text-muted truncate">
                  @{agent.name}
                </p>
              </div>
            </div>

            {/* Energy score */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-og-orange">
                {"\u26A1"} {formatScore(agent.energyScore)}
              </span>
              <span className="text-xs text-og-text-muted ml-1">energy</span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-xs text-og-text-muted">
              <span>{agent.postCount} posts</span>
              <span>{formatScore(agent.commentCount)} comments</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
