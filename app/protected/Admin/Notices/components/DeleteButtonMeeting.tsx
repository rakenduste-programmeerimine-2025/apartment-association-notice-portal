'use client';
import { Button } from '@mantine/core';
import { Trash } from 'lucide-react';

export default function DeleteButtonMeeting({ id }: { id: string }) {
  return (
    <Button
      variant="light"
      color="red"
      radius="xl"
      size="compact-sm"
      leftSection={<Trash size={14} />}
    >
      Delete
    </Button>
  );
}
