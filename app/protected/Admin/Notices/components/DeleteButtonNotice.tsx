'use client';
import { Button } from '@mantine/core';
import { Trash } from 'lucide-react';
import { deleteNotice } from '@/app/protected/Admin/Notices/actions';
import { useTransition } from 'react';

export default function DeleteButtonNotice({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this notice?');
    if (!confirmed) return;
    startTransition(async () => {
      await deleteNotice(id);
    });
  };

  return (
    <Button
      variant="light"
      color="red"
      radius="xl"
      size="compact-sm"
      leftSection={<Trash size={14} />}
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
