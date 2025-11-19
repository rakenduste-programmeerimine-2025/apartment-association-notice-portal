'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Group, Container, Paper } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Admin/Notices', label: 'Notices' },
    { href: '/protected/Admin/Worries', label: 'Worries' },
    { href: '/protected/Admin/Residents', label: 'Residents' },
    { href: '/protected/Admin/Meetings', label: 'Create Meeting' },
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
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
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
