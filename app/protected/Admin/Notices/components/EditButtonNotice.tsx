'use client';
import { Button } from '@mantine/core';
import { Pencil } from 'lucide-react';

export default function EditButtonNotice({ id, onClick }: { id: string; onClick?: () => void }) {
  return (
    <Button
      variant="light"
      color="blue"
      radius="xl"
      size="compact-sm"
      leftSection={<Pencil size={14} />}
      onClick={onClick}
    >
      Edit
    </Button>
  );
}
