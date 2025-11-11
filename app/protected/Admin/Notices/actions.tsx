'use server';

// import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

export async function getNotices(): Promise<Notice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notices')
      .select('id, title, content, category, community_id, created_at')
      .order('id', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}


export async function getMeetings(): Promise<Meeting[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, description, meeting_date')
      .order('id', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}
