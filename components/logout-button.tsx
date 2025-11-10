'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button onClick={logout} variant="filled" color="gray" size="xs">
      Logout
    </Button>
  );
}
