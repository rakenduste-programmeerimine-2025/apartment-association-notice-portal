'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  await supabase.from('worries').delete().eq('created_by', id);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('community_id', profile.community_id);

  if (error) throw new Error(error.message);

  revalidatePath('/protected/Admin/Residents');
}
