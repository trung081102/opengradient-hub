'use client';

import { useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function useVotes() {
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const vote = useCallback(async (
    voteType: 1 | -1,
    postId?: string,
    commentId?: string
  ) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const key = postId ? `post:${postId}` : `comment:${commentId}`;
    const currentVote = userVotes[key];

    // If clicking same vote, remove it
    if (currentVote === voteType) {
      const deleteQuery = supabase.from('votes').delete().eq('user_id', user.id);
      if (postId) deleteQuery.eq('post_id', postId);
      if (commentId) deleteQuery.eq('comment_id', commentId);
      
      const { error } = await deleteQuery;
      if (error) return { error: error.message };
      
      setUserVotes((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return { error: null };
    }

    // Upsert vote
    const voteData: Record<string, unknown> = {
      user_id: user.id,
      vote_type: voteType,
    };
    if (postId) voteData.post_id = postId;
    if (commentId) voteData.comment_id = commentId;

    // Delete existing then insert (simpler than upsert with composite keys)
    const deleteQuery = supabase.from('votes').delete().eq('user_id', user.id);
    if (postId) deleteQuery.eq('post_id', postId);
    if (commentId) deleteQuery.eq('comment_id', commentId);
    await deleteQuery;

    const { error } = await supabase.from('votes').insert(voteData);
    if (error) return { error: error.message };

    setUserVotes((prev) => ({ ...prev, [key]: voteType }));
    return { error: null };
  }, [userVotes]);

  const getUserVotes = useCallback(async (postIds: string[]) => {
    if (!isSupabaseConfigured() || postIds.length === 0) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('votes')
      .select('post_id, comment_id, vote_type')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    if (data) {
      const votesMap: Record<string, number> = {};
      data.forEach((v: { post_id: string | null; comment_id: string | null; vote_type: number }) => {
        if (v.post_id) votesMap[`post:${v.post_id}`] = v.vote_type;
        if (v.comment_id) votesMap[`comment:${v.comment_id}`] = v.vote_type;
      });
      setUserVotes((prev) => ({ ...prev, ...votesMap }));
    }
  }, []);

  return { userVotes, vote, getUserVotes };
}
