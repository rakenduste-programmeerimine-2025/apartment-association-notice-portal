'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Group, Container, Paper } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';

export function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Resident/Notices', label: 'Notices' },
    { href: '/protected/Resident/Worries', label: 'Worries' },
    { href: '/protected/Resident/Worries/Create', label: 'Create Worry' },
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
