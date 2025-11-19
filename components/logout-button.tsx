'use client';

import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Clear sid cookie (your auth session)
    document.cookie = 'sid=; Max-Age=0; path=/;';

    // 2. Show confirmation toast
    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out.',
      color: 'gray',
    });

    // 3. Redirect to login and replace history
    router.replace('/auth/login');
  };

  return (
    <Button onClick={handleLogout} variant="filled" color="gray" size="xs">
      Logout
    </Button>
  );
}
