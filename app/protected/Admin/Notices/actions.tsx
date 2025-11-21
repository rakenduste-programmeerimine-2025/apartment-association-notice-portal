'use server';

import { revalidatePath } from 'next/cache';
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
      .select('id, title, description, meeting_date, community_id')
      .eq('community_id', profile.community_id)
      .order('meeting_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw err;
  }
}

//edit/update Notice
export async function updateNotice(
  id: string,
  values: { title: string; content: string; category: string }
) {
  const supabase = await createClient();

  // get logged in user + community
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  // secure update
  const { error } = await supabase
    .from('notices')
    .update({
      title: values.title,
      content: values.content,
      category: values.category,
    })
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

//edit/update Meeting
export async function updateMeeting(
  id: string,
  values: { title: string; description: string; meeting_date: string }
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
    .update({
      title: values.title,
      description: values.description,
      meeting_date: values.meeting_date,
    })
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Notices');
}

//delete Notice
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

//delete Meeting
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