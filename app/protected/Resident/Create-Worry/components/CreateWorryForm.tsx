'use client';

import '@mantine/core/styles.css';
import {
  TextInput,
  Textarea,
  Button,
  Card,
  Group,
  Title,
  Stack,
  Text,
  LoadingOverlay,
} from '@mantine/core';

import { useTransition, useState } from 'react';
import { createWorry } from '../actions';
import { FileText } from 'lucide-react';
import { notifications } from '@mantine/notifications';

export default function CreateNoticeForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function validate(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();

    if (!title) return 'Title is required.';
    if (!content) return 'Description is required.';
    if (title.length > 200) return 'Title is too long.';

    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const validationError = validate(formData);

    if (validationError) {
      notifications.show({
        title: 'Error',
        message: validationError,
        color: 'red',
      });
      return;
    }

    const form = e.currentTarget;

    form.reset();
    setTitle('');
    setContent('');

    startTransition(async () => {
      try {
        await createWorry(formData);

        notifications.show({
          title: 'Created Worry',
          message: 'Worry created successfully!',
          color: 'green',
        });
      } catch (err) {
        if (err instanceof Error) {
          const map: Record<string, string> = {
            ERROR_NO_TITLE: 'Title is required.',
            ERROR_TITLE_TOO_LONG: 'Title is too long.',
            ERROR_DESCRIPTION_TOO_LONG: 'Description is too long.',
            ERROR_UNAUTHORIZED: 'You are not authorized.',
            ERROR_USER_HAS_NO_COMMUNITY: 'You are not assigned to a community.',
            ERROR_DB_INSERT_FAILED: 'Failed to save the notice.',
            ERROR_FETCHING_PROFILE: 'Cannot load profile.',
            ERROR_UNKNOWN: 'Unexpected server error.',
          };

          const message = map[err.message] ?? 'Unexpected server error.';

          notifications.show({
            title: 'Error',
            message: message,
            color: 'red',
          });
        } else {
          notifications.show({
            title: 'Unexpected Error',
            message: 'Unexpected server error. Please try again later.',
            color: 'red',
          });
        }
      }
    });
  }

  return (
    <Card
      radius="lg"
      padding="xl"
      withBorder
      style={{
        width: '100%',
        maxWidth: 650,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <LoadingOverlay visible={isPending} zIndex={20} />

      <Title order={2} mb="lg">
        Create a Worry
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            name="title"
            label="Title"
            placeholder="Write the worry title..."
            leftSection={<FileText size={18} />}
            radius="md"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            name="content"
            label="Description"
            placeholder="Write your worry..."
            radius="md"
            minRows={2}
            autosize
            leftSection={<FileText size={16} />}
            value={content}
            required
            onChange={(e) => setContent(e.target.value)}
          />

          <Group justify="flex-end" mt="sm">
            <Button type="submit" radius="md" size="md">
              Send
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
