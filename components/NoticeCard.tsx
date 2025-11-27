'use client';
import { useState } from 'react';
import { Card, Text, Badge, Group } from '@mantine/core';
import type { Notice } from '@/types/Notice';
import DeleteButtonNotice from '@/app/protected/Admin/Notices/components/DeleteButtonNotice';
import EditButtonNotice from '@/app/protected/Admin/Notices/components/EditButtonNotice';
import EditNoticeModal from '@/app/protected/Admin/Notices/components/EditNoticeModal';
import { updateNotice, deleteNotice } from '@/app/protected/Admin/Notices/actions';

interface Props {
  notice: Notice;
  role?: 'admin' | 'resident';
  onUpdate?: (values: { title: string; content: string; category: string }) => void; // 
  onDelete?: () => void; 
}

export default function NoticeCard({ notice, role, onUpdate, onDelete }: Props) {
  const [opened, setOpened] = useState(false);

  const date = new Date(notice.created_at);
  const formattedDate = `${date.getUTCDate().toString().padStart(2, '0')} ${date.toLocaleString(
    'en-GB',
    { month: 'short' }
  )} ${date.getUTCFullYear()}`;

  const formattedTime = `${date.getUTCHours().toString().padStart(2, '0')}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}`;

  const badgeColor =
    notice.category === 'General'
      ? 'green'
      : notice.category === 'Maintenance'
      ? 'yellow'
      : notice.category === 'Safety'
      ? 'blue'
      : 'gray';


  const handleUpdate = async (values: { title: string; content: string; category: string }) => {
    await updateNotice(notice.id, values); 
    onUpdate?.(values); 
  };

  const handleDelete = async () => {
    await deleteNotice(notice.id);
    onDelete?.(); 
  };

  return (
    <>
      <Card radius="md" padding="sm" withBorder style={{ maxWidth: 600, margin: '18xpx auto' }}>
        <Group justify="space-between" mb="xs">
          <Badge color={badgeColor} size="sm" variant="filled">
            {notice.category}
          </Badge>
          <Text size="xs" c="gray">
            Created at: {formattedDate}, {formattedTime}
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
            <EditButtonNotice id={notice.id} onClick={() => setOpened(true)} />
            <DeleteButtonNotice id={notice.id} onClick={handleDelete} />
          </Group>
        )}
      </Card>

      <EditNoticeModal
        opened={opened}
        onClose={() => setOpened(false)}
        notice={notice}
        onSubmit={handleUpdate} 
      />
    </>
  );
}
