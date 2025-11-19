'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button, Group, Container, Paper } from '@mantine/core';
import { LogoutButton } from '@/components/logout-button';

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Admin/Notices', label: 'Notices' },
    { href: '/protected/Admin/Worries', label: 'Worries' }, 
    { href: '/protected/Admin/Residents', label: 'Residents' },
    { href: '/protected/Admin/Create-Meetings', label: 'Create Meetings' },
    { href: '/protected/Admin/CreateNotice', label: 'Create Notice' }, //url needs to be changed to create notice page, there is needs to be such a folder for it.
  ];

  return (
    <Paper component="nav" radius={0} withBorder>
      <Container size="lg" h={56} px="md">
        <Group justify="space-between" align="center" h="100%">
          <Group gap="xs">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Button
                  key={href}
                  onClick={() => router.push(href)}
                  variant={isActive ? 'light' : 'subtle'}
                  size="xs"
                >
                  {label}
                </Button>
              );
            })}
          </Group>

          <LogoutButton />
        </Group>
      </Container>
    </Paper>
  );
}


