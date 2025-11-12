'use client';
import { Card, Text, Badge, Group, Button } from '@mantine/core';
import type { Notice } from '@/types/Notice';
import DeleteButtonNotice from '@/app/protected/Admin/Notices/components/DeleteButtonNotice';
import EditButtonNotice from '@/app/protected/Admin/Notices/components/EditButtonNotice';

interface Props {
  notice: Notice;
  role?: 'admin' | 'resident';
}

export default function NoticeCard({ notice, role }: Props) {
  const date = new Date(notice.created_at);
  const formattedDate = `${date.getUTCDate().toString().padStart(2, '0')} ${date.toLocaleString(
    'en-GB',
    {
      month: 'short',
    }
  )} ${date.getUTCFullYear()}`;

  const formattedTime = `${date.getUTCHours().toString().padStart(2, '0')}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}`;

  //defining the color of badge based on category
  const badgeColor =
    notice.category === 'General'
      ? 'green'
      : notice.category === 'Maintenance'
        ? 'yellow'
        : notice.category === 'Safety'
          ? 'blue'
          : 'gray';

  return (
    <Card radius="md" padding="sm" withBorder style={{ maxWidth: 600, margin: '18xpx auto' }}>
      <Group justify="space-between" mb="xs">
        <Badge color={badgeColor} size="sm" variant="filled">
          {notice.category}
        </Badge>
        <Text size="xs" c="gray">
          Created at: {formattedDate}, {formattedTime},
        </Text>
      </Group>

      <Text fw={600} size="md" mb={4}>
        {notice.title}
      </Text>

      <Text size="sm" c="dimmed" lh={1.5}>
        {notice.content}
      </Text>

      {role === 'admin' && (
        <Group justify="flex-end" mt="md">
          <EditButtonNotice id={notice.id} />
          <DeleteButtonNotice id={notice.id} />
        </Group>
      )}
    </Card>
  );
}
