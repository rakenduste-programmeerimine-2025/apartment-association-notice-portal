'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Group, Container, Paper, Badge, Tooltip } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';

type CommunityProps = {
  community: { id: string; full_address: string } | null;
};

export function UserNavbar({ community }: CommunityProps) {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: '/protected/Resident/Notices', label: 'Notices' },
    { href: '/protected/Resident/Worries', label: 'Worries' },
    { href: '/protected/Resident/Create-Worry', label: 'Create Worry' },
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
