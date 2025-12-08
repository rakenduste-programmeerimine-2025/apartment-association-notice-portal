'use client';

import { useState, useTransition } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { removeResidentAction } from '../actions';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  mode: 'reject' | 'remove';
  onDone?: () => void;
}

export default function DeleteResidentButton({ id, mode, onDone }: Props) {
  const [opened, setOpened] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = mode === 'reject' ? 'Reject resident' : 'Remove resident';
  const message =
    mode === 'reject'
      ? 'Are you sure you want to reject this resident request? This will remove the user from the community.'
      : 'Are you sure you want to remove this resident? This will delete the user and their worries.';

  const buttonLabel = mode === 'reject' ? 'Reject' : 'Remove';

  const handleConfirm = () => {
    startTransition(async () => {
      await removeResidentAction(id);
      onDone?.();
      setOpened(false);
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpened(true)}
        disabled={isPending}
      >
        {isPending ? `${buttonLabel}…` : buttonLabel}
      </Button>

      <ConfirmModal
        opened={opened}
        onClose={() => setOpened(false)}
        onConfirm={handleConfirm}
        loading={isPending}
        title={title}
        message={message}
      />
    </>
  );
}
