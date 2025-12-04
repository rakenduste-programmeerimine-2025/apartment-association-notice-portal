'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type AdminResident = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'resident' | null;
  community_id: string | null;
  flat_number: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | null;
};

// LIST RESIDENTS FILTERED BY ADMIN'S COMMUNITY
export async function getResidents(
  page = 1,
  limit = 200, // can be large, we then slice into pending/approved/admins on client
  sort: 'newest' | 'oldest' = 'newest'
): Promise<{ data: AdminResident[]; count: number }> {
  try {
    const supabase = await createClient();

    // 1) current admin
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { data: [], count: 0 };

    // 2) admin profile to get community_id
    const { data: profile } = await supabase
      .from('users')
      .select('community_id')
      .eq('id', auth.user.id)
      .single();

    if (!profile?.community_id) {
      return { data: [], count: 0 };
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 3) filter users by same community_id
    let query = supabase
      .from('users')
      .select(
        'id, email, full_name, role, community_id, flat_number, created_at, status',
        { count: 'exact' }
      )
      .eq('community_id', profile.community_id);

    query = query.order('created_at', { ascending: sort === 'oldest' });

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;

    return {
      data: (data ?? []) as AdminResident[],
      count: count ?? 0,
    };
  } catch (err) {
    console.error('Error fetching residents:', err);
    return { data: [], count: 0 };
  }
}

// DELETE RESIDENT (your previous logic, kept)
export async function removeResidentAction(id: string) {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('ERROR_UNAUTHORIZED_USER');

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) throw new Error('ERROR_UNAUTHORIZED_COMMUNITY');

  // delete their worries
  await supabase.from('worries').delete().eq('created_by', id);

  // delete the user but only in the same community
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Residents');
}
