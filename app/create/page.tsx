'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePosts } from '@/lib/hooks/usePosts';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { spaces as mockSpaces } from '@/lib/mockData';

interface SpaceOption {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createPost } = usePosts();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/create');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadSpaces() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase
          .from('spaces')
          .select('id, name, slug, icon')
          .order('name');
        if (data && data.length > 0) {
          setSpaces(data as SpaceOption[]);
          setSpaceId(data[0].id);
          return;
        }
      }
      // Fallback to mock spaces
      const mapped = mockSpaces.map((s) => ({ id: s.id, name: s.name, slug: s.slug, icon: s.icon }));
      setSpaces(mapped);
      if (mapped.length > 0) setSpaceId(mapped[0].id);
    }
    loadSpaces();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !spaceId) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setSubmitting(true);

    const { data, error } = await createPost(title.trim(), body.trim(), spaceId);
    if (error) {
      setError(error);
      setSubmitting(false);
    } else if (data) {
      router.push(`/post/${data.id}`);
    } else {
      setError('Failed to create post');
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-og-surface flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-og-purple border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <span className="text-white font-bold text-lg">opengradient</span>
        </Link>
        <div className="flex-1" />
        <Link href="/" className="text-og-text-secondary hover:text-white text-sm transition-colors">
          Cancel
        </Link>
      </header>

      {/* Create Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a post</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Space selector */}
          <div>
            <label htmlFor="space" className="block text-sm font-medium text-gray-700 mb-1.5">
              Space
            </label>
            <select
              id="space"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="An interesting title for your post"
              required
              maxLength={300}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/300</p>
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                Body
              </label>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-og-purple hover:text-og-purple-dark transition-colors"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="w-full min-h-[200px] p-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm prose prose-sm max-w-none">
                {body || <span className="text-gray-400 italic">Nothing to preview</span>}
              </div>
            ) : (
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your post here... Markdown is supported!"
                required
                rows={10}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple resize-y font-mono"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">Supports Markdown formatting</p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
              className="px-6 py-2.5 bg-og-purple hover:bg-og-purple-dark text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
