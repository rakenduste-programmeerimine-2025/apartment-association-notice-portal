'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CommunityId } from '@/types/community';

export type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  created_by: string | null;
  community_id: CommunityId;
};

export async function getWorries(
  page = 1,
  limit = 3,
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ data: Worry[]; count: number }> {
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

    let query = supabase
      .from('worries')
      .select('id, title, content, created_at, created_by, community_id', { count: 'exact' })
      .eq('community_id', profile.community_id);

    query = query.order('created_at', { ascending: sort === 'oldest' });

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return { data: data ?? [], count: count ?? 0 };
  } catch (err) {
    console.error('Error fetching worries:', err);
    return { data: [], count: 0 };
  }
}

export async function deleteWorry(id: string) {
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
    .from('worries')
    .delete()
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Worries');
}