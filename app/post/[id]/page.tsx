'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useComments, type CommentWithAuthor } from '@/lib/hooks/useComments';
import { useVotes } from '@/lib/hooks/useVotes';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockPosts } from '@/lib/mockData';

interface PostDetail {
  id: string;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_color: string;
    is_verified: boolean;
  };
  space: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
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
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentComponent({
  comment,
  postId,
  user,
  depth = 0,
  onReply,
}: {
  comment: CommentWithAuthor;
  postId: string;
  user: { id: string } | null;
  depth?: number;
  onReply: (parentId: string, body: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { userVotes, vote } = useVotes();

  const commentKey = `comment:${comment.id}`;
  const currentVote = userVotes[commentKey];
  const score = comment.upvotes - comment.downvotes + (currentVote === 1 ? 1 : currentVote === -1 ? -1 : 0);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="py-3">
        {/* Comment header */}
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: comment.author?.avatar_color || '#8B5CF6' }}
          >
            {(comment.author?.display_name || comment.author?.username || 'U')[0].toUpperCase()}
          </span>
          <Link href={`/u/${comment.author?.username}`} className="font-medium text-gray-700 hover:underline">
            {comment.author?.display_name || comment.author?.username || 'Unknown'}
          </Link>
          <span className="text-gray-400">&middot;</span>
          <span className="text-og-text-muted">{formatTimeAgo(comment.created_at)}</span>
        </div>

        {/* Comment body */}
        <p className="text-sm text-gray-700 mb-2">{comment.body}</p>

        {/* Comment actions */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => user && vote(1, undefined, comment.id)}
              className={`p-0.5 rounded transition-colors ${currentVote === 1 ? 'text-og-purple' : 'text-gray-400 hover:text-og-purple'}`}
            >
              <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor"><path d="M8 0L15 12H1L8 0Z" /></svg>
            </button>
            <span className={`font-medium ${currentVote === 1 ? 'text-og-purple' : currentVote === -1 ? 'text-red-500' : 'text-gray-600'}`}>
              {score}
            </span>
            <button
              onClick={() => user && vote(-1, undefined, comment.id)}
              className={`p-0.5 rounded transition-colors ${currentVote === -1 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <svg width="12" height="9" viewBox="0 0 16 12" fill="currentColor"><path d="M8 12L1 0H15L8 12Z" /></svg>
            </button>
          </div>
          {user && depth < 3 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-og-text-muted hover:text-og-purple transition-colors font-medium"
            >
              Reply
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReply && (
          <div className="mt-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple resize-y"
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="px-3 py-1 bg-og-purple hover:bg-og-purple-dark text-white text-xs rounded font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                onClick={() => { setShowReply(false); setReplyText(''); }}
                className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              postId={postId}
              user={user}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const { comments, loading: commentsLoading, fetchComments, createComment } = useComments();
  const { userVotes, vote, getUserVotes } = useVotes();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPost = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(id, username, display_name, avatar_color, is_verified),
          space:spaces!space_id(id, name, slug, icon)
        `)
        .eq('id', postId)
        .single();

      if (data) {
        setPost(data as unknown as PostDetail);
        setLoading(false);
        return;
      }
    }

    // Fallback to mock data
    const mockPost = mockPosts.find((p) => p.id === postId);
    if (mockPost) {
      setPost({
        id: mockPost.id,
        title: mockPost.title,
        body: mockPost.body,
        upvotes: mockPost.upvotes,
        downvotes: mockPost.downvotes,
        comment_count: mockPost.commentCount,
        created_at: new Date().toISOString(),
        author: {
          id: mockPost.author.id,
          username: mockPost.author.name,
          display_name: mockPost.author.displayName,
          avatar_color: mockPost.author.avatarColor,
          is_verified: mockPost.author.isVerified,
        },
        space: {
          id: mockPost.space.id,
          name: mockPost.space.name,
          slug: mockPost.space.slug,
          icon: mockPost.space.icon,
        },
      });
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadPost();
    fetchComments(postId);
    getUserVotes([postId]);
  }, [postId, loadPost, fetchComments, getUserVotes]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const { error } = await createComment(postId, newComment.trim());
    if (!error) {
      setNewComment('');
      fetchComments(postId);
    }
    setSubmittingComment(false);
  };

  const handleReply = async (parentId: string, body: string) => {
    await createComment(postId, body, parentId);
    fetchComments(postId);
  };

  const postKey = `post:${postId}`;
  const currentVote = userVotes[postKey];

  if (loading) {
    return (
      <div className="min-h-screen bg-og-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-og-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-og-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <Link href="/" className="text-og-purple hover:underline text-sm">Back to home</Link>
        </div>
      </div>
    );
  }

  const score = post.upvotes - post.downvotes + (currentVote === 1 ? 1 : currentVote === -1 ? -1 : 0);

  return (
    <div className="min-h-screen bg-og-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 h-[60px] bg-og-dark border-b-4 border-og-purple flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #00D4AA)' }}
          >
            OG
          </div>
          <span className="text-white font-bold text-lg hidden sm:inline">opengradient</span>
        </Link>
        <div className="flex-1" />
        <Link href="/" className="text-og-text-secondary hover:text-white text-sm transition-colors">
          &larr; Back
        </Link>
      </header>

      {/* Post Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <article className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            {/* Vote column */}
            <div className="w-12 flex flex-col items-center py-4 px-2 bg-gray-50 shrink-0">
              <button
                onClick={() => user && vote(1, postId)}
                className={`p-0.5 rounded transition-colors ${currentVote === 1 ? 'text-og-purple' : 'text-gray-400 hover:text-og-purple'}`}
              >
                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 0L15 12H1L8 0Z" /></svg>
              </button>
              <span className={`text-sm font-bold my-1 ${currentVote === 1 ? 'text-og-purple' : currentVote === -1 ? 'text-red-500' : 'text-gray-700'}`}>
                {score}
              </span>
              <button
                onClick={() => user && vote(-1, postId)}
                className={`p-0.5 rounded transition-colors ${currentVote === -1 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              >
                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 12L1 0H15L8 12Z" /></svg>
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1 p-5">
              {/* Meta */}
              <div className="flex items-center gap-2 text-xs mb-3">
                <Link href={`/${post.space.slug}`} className="text-og-blue font-medium hover:underline">
                  {post.space.icon} {post.space.name}
                </Link>
                <span className="text-gray-300">&middot;</span>
                <div className="flex items-center gap-1">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: post.author.avatar_color }}
                  >
                    {(post.author.display_name || post.author.username)[0].toUpperCase()}
                  </span>
                  <Link href={`/u/${post.author.username}`} className="text-gray-700 hover:underline">
                    {post.author.display_name || post.author.username}
                  </Link>
                  {post.author.is_verified && (
                    <svg className="w-3.5 h-3.5 text-og-purple" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">&middot;</span>
                <span className="text-og-text-muted">{formatTimeAgo(post.created_at)}</span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {/* Body (Markdown) */}
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-og-text-muted">
                <span>{post.comment_count} comments</span>
                <span>{post.upvotes} upvotes</span>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Comments ({comments.length})
          </h2>

          {/* Add comment */}
          {user ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple resize-y"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-1.5 bg-og-purple hover:bg-og-purple-dark text-white text-sm rounded font-medium transition-colors disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-gray-500">
                <Link href={`/login?redirectTo=/post/${postId}`} className="text-og-purple hover:underline">
                  Sign in
                </Link>{' '}
                to join the discussion
              </p>
            </div>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-og-purple border-t-transparent rounded-full" />
            </div>
          ) : comments.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment.id} className="px-4">
                  <CommentComponent
                    comment={comment}
                    postId={postId}
                    user={user}
                    onReply={handleReply}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-400">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
