'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button, Group, Container, Paper, Tooltip, Text, Badge } from '@mantine/core';
import { LogoutButton } from '@/components/logout-button';

type CommunityProps = {
  community: { id: string; full_address: string } | null;
};

export function AdminNavbar({ community }: CommunityProps) {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Admin/Notices', label: 'Notices' },
    { href: '/protected/Admin/Worries', label: 'Worries' },
    { href: '/protected/Admin/Residents', label: 'Residents' },
    { href: '/protected/Admin/Create-Meetings', label: 'Create Meetings' },
    { href: '/protected/Admin/CreateNotice', label: 'Create Notice' },
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
          <Group wrap="nowrap" gap="xs" justify="center" align="center">
            <Tooltip
              label={community?.full_address}
              withArrow
              color="rgba(0, 0, 0, 0.4)"
              multiline
              w={220}
              position="bottom"
            >
              <Badge
                variant="light"
                title=""
                style={{
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                {community?.full_address}
              </Badge>
            </Tooltip>

            <LogoutButton />
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}
