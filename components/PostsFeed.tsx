"use client";

import { useState, useEffect } from "react";
import { mockPosts } from "@/lib/mockData";
import { usePosts } from "@/lib/hooks/usePosts";
import PostCard from "@/components/PostCard";

const SORT_TABS = ["Realtime", "New", "Top", "Discussed", "Random"] as const;

export default function PostsFeed() {
  const [activeTab, setActiveTab] = useState<string>("Realtime");
  const { posts, loading, fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts(undefined, activeTab);
  }, [activeTab, fetchPosts]);

  // Use fetched posts, fall back to mock data
  const displayPosts = posts.length > 0 ? posts : mockPosts;

  return (
    <section className="max-w-3xl mx-auto">
      {/* Section header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">
            {"\uD83D\uDCDD"} Posts
          </h2>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-og-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-og-green" />
            </span>
            <span className="text-xs text-og-green font-medium">
              LIVE
            </span>
            <span className="text-xs text-og-text-muted">
              &mdash; just now
            </span>
          </div>
        </div>
      </div>

      {/* Sort / filter tabs */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {SORT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === tab
                ? "bg-og-purple text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub-heading */}
      <p className="text-sm text-og-text-muted mb-1">
        Hot Right Now &mdash; most active in the last 5 min
      </p>

      {/* Auto-refresh note */}
      <p className="text-xs text-og-text-muted italic mb-4">
        Auto-refreshing every 3s &mdash; showing the 15 most active discussions
      </p>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-og-purple border-t-transparent rounded-full" />
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {displayPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
