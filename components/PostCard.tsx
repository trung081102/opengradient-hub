"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useVotes } from "@/lib/hooks/useVotes";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { userVotes, vote } = useVotes();
  const [localVote, setLocalVote] = useState<'up' | 'down' | null>(null);

  const postKey = `post:${post.id}`;
  const supabaseVote = userVotes[postKey];

  // Use Supabase vote if available, otherwise use local state
  const effectiveVote = supabaseVote !== undefined
    ? (supabaseVote === 1 ? 'up' : supabaseVote === -1 ? 'down' : null)
    : localVote;

  const baseScore = post.upvotes - post.downvotes;
  const score =
    effectiveVote === 'up'
      ? baseScore + 1
      : effectiveVote === 'down'
        ? baseScore - 1
        : baseScore;

  async function handleVote(direction: 'up' | 'down') {
    if (user) {
      // Use Supabase voting
      const voteType = direction === 'up' ? 1 : -1;
      await vote(voteType as 1 | -1, post.id);
    } else {
      // Local-only toggle
      setLocalVote((prev) => (prev === direction ? null : direction));
    }
  }

  function getRankColor(rank: number): string {
    if (rank <= 3) return '#F59E0B';
    if (rank <= 6) return '#9CA3AF';
    return '#D1D5DB';
  }

  function getRankTextColor(rank: number): string {
    if (rank <= 3) return '#FFFFFF';
    if (rank <= 6) return '#FFFFFF';
    return '#6B7280';
  }

  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex overflow-hidden">
      {/* LEFT: Vote column */}
      <div className="w-12 flex flex-col items-center py-3 px-2 bg-gray-50 shrink-0">
        <button
          onClick={() => handleVote('up')}
          className={`p-0.5 rounded transition-colors ${
            effectiveVote === 'up'
              ? 'text-og-purple'
              : 'text-gray-400 hover:text-og-purple'
          }`}
          aria-label="Upvote"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 0L15 12H1L8 0Z" />
          </svg>
        </button>

        <span
          className={`text-sm font-bold my-1 ${
            effectiveVote === 'up'
              ? 'text-og-purple'
              : effectiveVote === 'down'
                ? 'text-og-red'
                : 'text-gray-700'
          }`}
        >
          {score}
        </span>

        <button
          onClick={() => handleVote('down')}
          className={`p-0.5 rounded transition-colors ${
            effectiveVote === 'down'
              ? 'text-og-red'
              : 'text-gray-400 hover:text-og-red'
          }`}
          aria-label="Downvote"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 12L1 0H15L8 12Z" />
          </svg>
        </button>
      </div>

      {/* RIGHT: Content */}
      <div className="flex-1 p-4 min-w-0">
        {/* Top meta row */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs mb-1.5">
          {/* Rank badge */}
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
            style={{
              backgroundColor: getRankColor(post.rank),
              color: getRankTextColor(post.rank),
            }}
          >
            {post.rank}
          </span>

          {/* Trend arrow */}
          {post.rankTrend === 'up' && (
            <svg
              className="w-3 h-3 text-og-green shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {post.rankTrend === 'down' && (
            <svg
              className="w-3 h-3 text-og-red shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {post.rankTrend === 'same' && (
            <span className="text-gray-400 shrink-0">&mdash;</span>
          )}

          {/* Space link */}
          <Link
            href={`/${post.space.slug}`}
            className="text-og-blue font-medium hover:underline"
          >
            {post.space.slug}
          </Link>

          <span className="text-gray-300">{"\u00B7"}</span>

          {/* Author avatar + name */}
          <div className="flex items-center gap-1">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: post.author.avatarColor }}
            >
              {post.author.avatar}
            </span>
            <Link
              href={`/u/${post.author.name}`}
              className="text-gray-700 hover:underline"
            >
              {post.author.displayName}
            </Link>
          </div>

          <span className="text-gray-300">{"\u00B7"}</span>

          {/* Timestamp */}
          <span className="text-og-text-muted">{post.createdAt}</span>
        </div>

        {/* Title - linked to post detail */}
        <Link href={`/post/${post.id}`}>
          <h3 className="font-semibold text-base text-gray-900 hover:text-og-purple cursor-pointer transition-colors leading-snug mb-1">
            {post.title}
          </h3>
        </Link>

        {/* Body preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {post.body}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 text-xs">
          {/* Comment count - linked */}
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1 text-og-text-muted hover:text-og-purple transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {post.commentCount} comments
          </Link>

          {/* Activity heat badge */}
          {post.recentActivityCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 font-medium">
              {"\uD83D\uDD25"} {post.recentActivityCount} in{' '}
              {post.recentActivityWindow}
            </span>
          )}
        </div>

        {/* Latest comment preview */}
        {post.latestComment && (
          <div className="bg-gray-50 rounded p-2 mt-2">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">
                {post.latestComment.author}
              </span>
              :{' '}
              <span className="italic">{post.latestComment.preview}</span>
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
