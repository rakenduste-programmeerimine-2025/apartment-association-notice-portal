'use client';

import { useState, useTransition } from 'react';
import { Button } from '@mantine/core';
import { Trash } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deleteMeeting } from '@/app/protected/Admin/Notices/actions';

interface Props {
  id: string;
  onClick?: () => void;
}

export default function DeleteButtonMeeting({ id, onClick }: Props) {
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteMeeting(id);
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
        title="Delete meeting"
        message="Are you sure you want to delete this meeting?"
      />
    </>
  );
}
