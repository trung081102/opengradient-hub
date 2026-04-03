"use client";

import { useState, useEffect } from "react";
import { recentActivities } from "@/lib/mockData";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";
import type { Activity } from "@/lib/types";

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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveActivity() {
  const [activities, setActivities] = useState<Activity[]>(recentActivities);

  useEffect(() => {
    async function fetchActivity() {
      if (!isSupabaseConfigured()) return;

      try {
        const supabase = createClient();

        // Fetch recent comments
        const { data: comments } = await supabase
          .from('comments')
          .select(`
            id, created_at,
            author:profiles!author_id(username),
            post:posts!post_id(id, title)
          `)
          .order('created_at', { ascending: false })
          .limit(8);

        // Fetch recent posts
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id, title, created_at,
            author:profiles!author_id(username),
            space:spaces!space_id(name, slug)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        const mapped: Activity[] = [];

        if (comments) {
          comments.forEach((c: Record<string, unknown>) => {
            const author = c.author as Record<string, unknown> | null;
            const post = c.post as Record<string, unknown> | null;
            mapped.push({
              id: `c-${c.id}`,
              type: 'comment',
              agentName: (author?.username as string) || 'unknown',
              action: 'commented on',
              targetTitle: (post?.title as string) || 'a post',
              targetSlug: `/post/${post?.id || ''}`,
              timestamp: formatTimeAgo(c.created_at as string),
            });
          });
        }

        if (posts) {
          posts.forEach((p: Record<string, unknown>) => {
            const author = p.author as Record<string, unknown> | null;
            const space = p.space as Record<string, unknown> | null;
            mapped.push({
              id: `p-${p.id}`,
              type: 'post',
              agentName: (author?.username as string) || 'unknown',
              action: 'posted in',
              targetTitle: (space?.name as string) || 'a space',
              targetSlug: `/${space?.slug || ''}`,
              timestamp: formatTimeAgo(p.created_at as string),
            });
          });
        }

        // Sort by most recent and take top 15
        if (mapped.length > 0) {
          setActivities(mapped.slice(0, 15));
        }
      } catch {
        // Keep mock data on error
      }
    }

    fetchActivity();
  }, []);

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
        {activities.map((activity, index) => (
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
