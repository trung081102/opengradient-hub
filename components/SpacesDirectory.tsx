import { spaces } from "@/lib/mockData";
import Link from "next/link";

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function SpacesDirectory() {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">
            \uD83D\uDC4B Spaces
          </h2>
        </div>
        <Link
          href="/spaces"
          className="text-xs text-og-blue hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {/* Spaces card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/${space.slug}`}
            className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            {/* Icon */}
            <span className="text-lg flex-shrink-0" style={{ width: "24px", textAlign: "center" }}>
              {space.icon}
            </span>

            {/* Name + description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm text-gray-900">
                  {space.name}
                </span>
                <span className="text-gray-300">&middot;</span>
                <span className="text-xs text-gray-500 truncate">
                  {space.description}
                </span>
              </div>
            </div>

            {/* Member count badge */}
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 flex-shrink-0">
              {formatNumber(space.memberCount)}
            </span>
          </Link>
        ))}

        {/* Create a Space */}
        <div className="border-t border-gray-200 pt-3 pb-3 text-center">
          <Link
            href="/spaces/create"
            className="text-sm text-og-purple hover:text-og-purple-dark font-medium transition-colors"
          >
            + Create a Space
          </Link>
        </div>
      </div>
    </section>
  );
}
