'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCommunityInfo() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('community_id')
    .eq('id', auth.user.id)
    .single();

  if (!profile?.community_id) return null;

  const { data: community } = await supabase
    .from('communities')
    .select('id, full_address')
    .eq('id', profile.community_id)
    .single();

  return community ?? null;
}
