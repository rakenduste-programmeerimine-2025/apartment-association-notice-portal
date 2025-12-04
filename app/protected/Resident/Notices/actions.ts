'use server';

import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

// ----------------------------
// GET NOTICES (WITH LIKES)
// ----------------------------
export async function getNotices(
  page = 1,
  limit = 3,
  category?: string,
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ data: Notice[]; count: number }> {
  try {
    const supabase = await createClient();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { data: [], count: 0 };

    const { data: profile } = await supabase
      .from('users')
      .select('community_id')
      .eq('id', auth.user.id)
      .single();

    if (!profile?.community_id) return { data: [], count: 0 };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // SELECT not only notices but also likes
    let query = supabase
      .from('notices')
      .select(
        `
        id,
        title,
        content,
        category,
        community_id,
        created_at,
        likesNotices (
          id,
          user_id
        )
      `,
        { count: 'exact' }
      )
      .eq('community_id', profile.community_id);

    if (category && category !== '') {
      query = query.eq('category', category);
    }

    query = query.order('created_at', { ascending: sort === 'oldest' });

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    // Map Supabase result → Notice with likesCount + hasLiked
    const notices: Notice[] =
      (data ?? []).map((row: any) => {
        const likes = row.likesNotices ?? [];
        const likesCount = likes.length;
        const hasLiked = likes.some((l: any) => l.user_id === auth.user.id);

        const { likesNotices, ...rest } = row;
        return {
          ...rest,
          likesCount,
          hasLiked,
        } as Notice;
      });

    return { data: notices, count: count ?? 0 };
  } catch (err) {
    throw err;
  }
}

// ----------------------------
// GET MEETINGS
// ----------------------------
export async function getMeetings(): Promise<Meeting[]> {
  try {
    const supabase = await createClient();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data: profile } = await supabase
      .from('users')
      .select('community_id')
      .eq('id', auth.user.id)
      .single();

    if (!profile?.community_id) return [];

    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, description, meeting_date, community_id, duration')
      .eq('community_id', profile.community_id)
      .order('meeting_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}

// ----------------------------
// LIKE / UNLIKE NOTICE
// ----------------------------
export async function toggleNoticeLike(
  noticeId: string
): Promise<{ liked: boolean; likesCount: number }> {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    throw new Error('Not authenticated');
  }

  // Check if user already liked it
  const { data: existing, error: existingError } = await supabase
    .from('likesNotices')
    .select('id')
    .eq('notice_id', noticeId)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    throw existingError;
  }

  if (existing) {
    // UNLIKE
    const { error: delError } = await supabase
      .from('likesNotices')
      .delete()
      .eq('id', existing.id);

    if (delError) throw delError;
  } else {
    // LIKE
    const { error: insError } = await supabase
      .from('likesNotices')
      .insert({
        notice_id: noticeId,
        user_id: auth.user.id,
      });

    if (insError) throw insError;
  }

  // Count total likes for this notice
  const { count } = await supabase
    .from('likesNotices')
    .select('*', { count: 'exact', head: true })
    .eq('notice_id', noticeId);

  return {
    liked: !existing,
    likesCount: count ?? 0,
  };
}
