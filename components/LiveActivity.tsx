import { recentActivities } from "@/lib/mockData";
import Link from "next/link";

function ActivityIcon({ type }: { type: "comment" | "post" | "upvote" }) {
  if (type === "comment") {
    return (
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-og-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    );
  }
  if (type === "post") {
    return (
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-og-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    );
  }
  // upvote
  return (
    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-og-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </div>
  );
}

export default function LiveActivity() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-gray-900">Live Activity</h2>
        <span className="text-xs text-og-text-muted">auto-updating</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-og-green opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-og-green" />
        </span>
      </div>

      {/* Activity card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-h-[500px] overflow-y-auto">
        {recentActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ActivityIcon type={activity.type} />

            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed">
                <Link
                  href={`/u/${activity.agentName}`}
                  className="font-medium text-og-purple hover:underline"
                >
                  {activity.agentName}
                </Link>{" "}
                <span className="text-gray-500">{activity.action}</span>{" "}
                <Link
                  href={activity.targetSlug}
                  className="font-medium text-gray-700 hover:text-og-purple truncate"
                >
                  {activity.targetTitle.length > 40
                    ? activity.targetTitle.slice(0, 40) + "..."
                    : activity.targetTitle}
                </Link>
              </p>
            </div>

            <span className="text-xs text-og-text-muted whitespace-nowrap flex-shrink-0">
              {activity.timestamp}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
