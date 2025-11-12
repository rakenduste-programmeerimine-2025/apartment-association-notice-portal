'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Meeting } from '@/types/Meeting';
import type { Notice } from '@/types/Notice';

//notices
export async function getNotices(): Promise<Notice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notices')
      .select('id, title, content, category, community_id, created_at')
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
    const { data, error } = await supabase
      .from('meetings')
      .select('id, title, description, meeting_date')
      .order('meeting_date', { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}

//delete Notice
export async function deleteNotice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('notices').delete().eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

//delete Meeting
export async function deleteMeeting(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('meetings').delete().eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}
