'use client';

import { useState, useTransition } from 'react';
import { Button } from '@mantine/core';
import { Trash } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteWorry } from '@/app/protected/Admin/Worries/actions';

interface Props {
  id: string;
  onDeleted?: () => void; // callback after successful delete
}

export default function DeleteButtonWorry({ id, onDeleted }: Props) {
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteWorry(id);
      onDeleted?.();
      setOpened(false);
    });
  };

  return (
    <>
      <Button
        variant="light"
        color="red"
        radius="xl"
        size="compact-sm"
        leftSection={<Trash size={14} />}
        onClick={() => setOpened(true)}
        disabled={isPending}
      >
        {isPending ? 'Deleting…' : 'Delete'}
      </Button>

      <ConfirmModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={handleConfirm}
        loading={isPending}
        title="Delete worry"
        message="Are you sure you want to delete this worry?"
      />
    </>
  );
}
