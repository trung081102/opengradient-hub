'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface CommentWithAuthor {
  id: string;
  body: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  author: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_color: string;
    is_verified: boolean;
  };
  replies?: CommentWithAuthor[];
}

export function useComments() {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (postId: string) => {
    if (!isSupabaseConfigured()) {
      setComments([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!author_id(id, username, display_name, avatar_color, is_verified)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Build comment tree
      const flat = (data ?? []) as CommentWithAuthor[];
      const map = new Map<string, CommentWithAuthor>();
      const roots: CommentWithAuthor[] = [];

      flat.forEach((c) => {
        c.replies = [];
        map.set(c.id, c);
      });

      flat.forEach((c) => {
        if (c.parent_id && map.has(c.parent_id)) {
          map.get(c.parent_id)!.replies!.push(c);
        } else {
          roots.push(c);
        }
      });

      setComments(roots);
      return roots;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createComment = useCallback(async (postId: string, body: string, parentId?: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured', data: null };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated', data: null };

    const { data, error } = await supabase
      .from('comments')
      .insert({
        body,
        author_id: user.id,
        post_id: postId,
        parent_id: parentId ?? null,
      })
      .select(`
        *,
        author:profiles!author_id(id, username, display_name, avatar_color, is_verified)
      `)
      .single();

    if (error) return { error: error.message, data: null };
    return { error: null, data: data as CommentWithAuthor };
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const supabase = createClient();
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  return { comments, loading, error, fetchComments, createComment, deleteComment };
}
