'use client';
import { Button } from '@mantine/core';
import { Pencil } from 'lucide-react';

interface Props {
  id: string;
  onClick?: () => void; // lisatud
}

export default function EditButtonNotice({ id, onClick }: Props) {
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
