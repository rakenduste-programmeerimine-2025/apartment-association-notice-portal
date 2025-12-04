'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

// ADMIN: Notices
export async function getNotices(
  page = 1,
  limit = 1,
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

    // UPDATED SELECT WITH likesNotices
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

    // ADMIN only needs like count
    const notices: Notice[] =
      (data ?? []).map((row: any) => {
        const likes = row.likesNotices ?? [];
        const likesCount = likes.length;

        const { likesNotices, ...rest } = row;
        return { ...rest, likesCount } as Notice;
      });

    return { data: notices, count: count ?? 0 };
  } catch (err) {
    throw err;
  }
}

// Meetings (unchanged)
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
      .select('id, title, description, meeting_date, duration, community_id')
      .eq('community_id', profile.community_id)
      .order('meeting_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}

export async function updateNotice(id: string, values: { title: string; content: string; category: string }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  const { error } = await supabase
    .from('notices')
    .update(values)
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

export async function updateMeeting(
  id: string,
  values: { title: string; description: string; meeting_date: string; duration: string }
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  const { error } = await supabase
    .from('meetings')
    .update(values)
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

export async function deleteNotice(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}
