'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockPosts } from '@/lib/mockData';
import type { Post } from '@/lib/types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (spaceSlug?: string, sortBy?: string) => {
    if (!isSupabaseConfigured()) {
      // Fallback to mock data
      let filtered = [...mockPosts];
      if (spaceSlug) {
        filtered = filtered.filter((p) => p.space.slug === spaceSlug);
      }
      setPosts(filtered);
      return filtered;
    }

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(*),
          space:spaces!space_id(*)
        `);

      if (spaceSlug) {
        query = query.eq('space.slug', spaceSlug);
      }

      switch (sortBy) {
        case 'New':
          query = query.order('created_at', { ascending: false });
          break;
        case 'Top':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'Discussed':
          query = query.order('comment_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(15);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Map Supabase data to Post type
      const mappedPosts: Post[] = (data ?? []).map((p: Record<string, unknown>, index: number) => {
        const author = p.author as Record<string, unknown> | null;
        const space = p.space as Record<string, unknown> | null;
        return {
          id: p.id as string,
          rank: index + 1,
          rankTrend: 'same' as const,
          title: p.title as string,
          body: p.body as string,
          author: {
            id: author?.id as string ?? '',
            name: author?.username as string ?? 'unknown',
            displayName: author?.display_name as string ?? author?.username as string ?? 'Unknown',
            avatar: ((author?.display_name as string ?? author?.username as string ?? 'U')[0] ?? 'U').toUpperCase(),
            avatarColor: author?.avatar_color as string ?? '#8B5CF6',
            isVerified: author?.is_verified as boolean ?? false,
            energyScore: author?.energy_score as number ?? 0,
            postCount: 0,
            commentCount: 0,
            upvoteCount: 0,
            joinedAt: author?.created_at as string ?? '',
          },
          space: {
            id: space?.id as string ?? '',
            name: space?.name as string ?? '',
            slug: space?.slug as string ?? '',
            description: space?.description as string ?? '',
            memberCount: space?.member_count as number ?? 0,
            icon: space?.icon as string ?? '',
          },
          upvotes: p.upvotes as number ?? 0,
          downvotes: p.downvotes as number ?? 0,
          commentCount: p.comment_count as number ?? 0,
          recentActivityCount: 0,
          recentActivityWindow: '5m',
          createdAt: formatTimeAgo(p.created_at as string),
        };
      });

      setPosts(mappedPosts);
      return mappedPosts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      // Fallback to mock data on error
      setPosts(mockPosts);
      return mockPosts;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (title: string, body: string, spaceId: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured', data: null };
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', data: null };

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, body, author_id: user.id, space_id: spaceId })
      .select()
      .single();

    if (error) return { error: error.message, data: null };
    return { error: null, data };
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
    
    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  return { posts, loading, error, fetchPosts, createPost, deletePost };
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
