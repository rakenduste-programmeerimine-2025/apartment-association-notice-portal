'use client';

import { useState, useTransition } from 'react';
import { Button } from '@mantine/core';
import { Trash } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteNotice } from '@/app/protected/Admin/Notices/actions';

interface Props {
  id: string;
  onClick?: () => void;
}

export default function DeleteButtonNotice({ id, onClick }: Props) {
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteNotice(id);
      onClick?.();
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
      >
        Delete
      </Button>

      <ConfirmModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={handleConfirm}
        loading={isPending}
        title="Delete notice"
        message="Are you sure you want to delete this notice?"
      />
    </>
  );
}
