'use client';

import { useState, useTransition } from 'react';
import { Card, Text, Badge, Group, Button } from '@mantine/core';
import type { Notice } from '@/types/Notice';
import DeleteButtonNotice from '@/app/protected/Admin/Notices/components/DeleteButtonNotice';
import EditButtonNotice from '@/app/protected/Admin/Notices/components/EditButtonNotice';
import EditNoticeModal from '@/app/protected/Admin/Notices/components/EditNoticeModal';
import { updateNotice, deleteNotice } from '@/app/protected/Admin/Notices/actions';
import { toggleNoticeLike } from '@/app/protected/Resident/Notices/actions';

interface Props {
  notice: Notice;
  role?: 'admin' | 'resident';
  onUpdate?: (values: { title: string; content: string; category: string }) => void;
  onDelete?: () => void;
  onAfterSave?: () => void;
}

export default function NoticeCard({ notice, role, onUpdate, onDelete, onAfterSave }: Props) {
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  // LIKE STATE
  const [liked, setLiked] = useState<boolean>(!!notice.hasLiked);
  const [likesCount, setLikesCount] = useState<number>(notice.likesCount ?? 0);

  const date = new Date(notice.created_at + 'Z');

  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

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

  // LIKE HANDLER (RESIDENT)
  const handleLike = () => {
    if (role !== 'resident') return;

    startTransition(async () => {
      try {
        const res = await toggleNoticeLike(notice.id);
        setLiked(res.liked);
        setLikesCount(res.likesCount);
      } catch (err) {
        console.error('Error toggling notice like:', err);
      }
    });
  };

  return (
    <>
      {/* width fixed to 100%, spacing handled by parent via gap */}
      <Card radius="md" padding="lg" withBorder shadow="sm" style={{ width: '100%' }}>
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

        {/* RESIDENT: like/unlike button */}
        {role === 'resident' && (
          <Group justify="flex-start" mt="md">
            <Button
              size="xs"
              variant={liked ? 'filled' : 'outline'}
              loading={isPending}
              onClick={handleLike}
            >
              {liked ? 'Unlike' : 'Like'} · {likesCount}
            </Button>
          </Group>
        )}

        {/* ADMIN: show like count + edit/delete */}
        {role === 'admin' && (
          <Group justify="space-between" mt="md">
            <Text size="xs" c="dimmed">
              Likes: {likesCount}
            </Text>

            <Group>
              <EditButtonNotice id={notice.id} onClick={() => setOpened(true)} />
              <DeleteButtonNotice id={notice.id} onClick={handleDelete} />
            </Group>
          </Group>
        )}
      </Card>

      {/* ADMIN EDIT MODAL */}
      <EditNoticeModal
        opened={opened}
        onClose={() => setOpened(false)}
        notice={notice}
        onSubmit={handleUpdate}
        onAfterSave={onAfterSave}
      />
    </>
  );
}
