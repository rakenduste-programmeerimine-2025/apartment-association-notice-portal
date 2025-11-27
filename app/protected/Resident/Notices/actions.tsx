'use server';

import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

// Notices 
export async function getNotices(page = 1, limit = 3): Promise<{ data: Notice[]; count: number }> {
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

    const { data, count, error } = await supabase
      .from('notices')
      .select('id, title, content, category, community_id, created_at', { count: 'exact' })
      .eq('community_id', profile.community_id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  } catch (err) {
    throw err;
  }
}

// Meetings 
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
