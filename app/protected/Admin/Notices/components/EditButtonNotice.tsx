'use client';
import { Button } from '@mantine/core';
import { Pencil } from 'lucide-react';

export default function EditButtonNotice({ id }: { id: string }) {
  return (
    <form>
      <Button
        variant="light"
        color="blue"
        radius="xl"
        size="compact-sm"
        leftSection={<Pencil size={14} />}
      >
        Edit
      </Button>
    </form>
  );
}
