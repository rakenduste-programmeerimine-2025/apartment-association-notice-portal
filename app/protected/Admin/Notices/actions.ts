'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

export async function deletePastMeetings() {
  try {
    const supabase = await createClient();
    const now = new Date();

    const { data: meetings } = await supabase
      .from('meetings')
      .select('id, meeting_date, duration');

    if (!meetings) return;

    for (const meeting of meetings) {
      
      const start = new Date(meeting.meeting_date.replace(' ', 'T'));

      const durationHours = parseFloat(meeting.duration);
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

      if (end < now) {
        await supabase.from('meetings').delete().eq('id', meeting.id);
      }
    }

    revalidatePath('/protected/Admin/Notices');
  } catch (err) {
    console.error('Error deleting past meetings:', err);
  }
}

export async function getNotices(
  page = 1,
  limit = 3, // this we can change :)
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

    //  include likesnotice  so admin can see number of likes
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
        likesnotice (
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

    // map likes into likesCount (admin doesn’t need hasLiked)
    const notices: Notice[] =
      (data ?? []).map((row: any) => {
        const likes = row.likesnotice ?? [];
        const likesCount = likes.length;

        const { likesnotice, ...rest } = row;
        return {
          ...rest,
          likesCount,
        } as Notice;
      });

    return { data: notices, count: count ?? 0 };
  } catch (err) {
    console.error('Error fetching admin notices:', err);
    return { data: [], count: 0 };
  }
}

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
    console.error('Error fetching admin meetings:', err);
    return [];
  }
}

export async function updateNotice(
  id: string,
  values: { title: string; content: string; category: string }
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
