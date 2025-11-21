'use server';

import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

//notices
export async function getNotices(): Promise<Notice[]> {
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
      .from('notices')
      .select('id, title, content, category, community_id, created_at')
      .eq('community_id', profile.community_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}

//meetings
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
