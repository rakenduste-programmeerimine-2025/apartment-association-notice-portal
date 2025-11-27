'use client';

import { Modal, TextInput, Textarea, Select, Button, Stack, Group } from '@mantine/core';
import { useState } from 'react';
import type { Notice } from '@/types/Notice';
import { Type, FileText, Tags, Check } from 'lucide-react';

interface Props {
  opened: boolean;
  onClose: () => void;
  notice: Notice;
  onSubmit: (values: { title: string; content: string; category: string }) => Promise<void> | void;
  onAfterSave?: () => void;
}

export default function EditNoticeModal({ opened, onClose, notice, onSubmit, onAfterSave }: Props) {
  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [category, setCategory] = useState(notice.category);

  const handleSave = async () => {
    await onSubmit({ title, content, category });
    onClose();
    if (onAfterSave) onAfterSave();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Notice" centered size="lg">
      <Stack gap="md">
        <TextInput
          label="Title"
          leftSection={<Type size={16} />}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
        />

        <Textarea
          label="Content"
          leftSection={<FileText size={16} />}
          autosize
          minRows={2}
          maxRows={6}
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
        />

        <Select
          label="Category"
          leftSection={<Tags size={16} />}
          data={['General', 'Maintenance', 'Safety']}
          value={category}
          onChange={(v) => v && setCategory(v)}
          onKeyDown={handleKeyPress}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>

          <Button leftSection={<Check size={16} />} onClick={handleSave}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
