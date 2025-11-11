'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button, Group, Container, Paper } from '@mantine/core';
import { LogoutButton } from '@/components/logout-button';

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Admin/Notices', label: 'Notices' },
    { href: '/admin/worries', label: 'Worries' },
    { href: '/admin/residents', label: 'Residents' },
    { href: '/admin/create-meeting', label: 'Create Meeting' },
    { href: '/admin/create-notice', label: 'Create Notice' },
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
