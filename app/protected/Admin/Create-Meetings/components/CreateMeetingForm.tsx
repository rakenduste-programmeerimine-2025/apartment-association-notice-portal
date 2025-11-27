'use client';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

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
  Select,
} from '@mantine/core';

import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useTransition, useState } from 'react';
import { createMeeting } from '../actions';
import { FileText, Calendar, Clock } from 'lucide-react';
import { notifications } from '@mantine/notifications';

export default function CreateMeetingForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState('');

  function validate(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const dateRaw = formData.get('date');
    const timeRaw = formData.get('time');
    const durationRaw = formData.get('duration');

    if (!title) return 'Title is required.';
    if (!description) return 'Description is required.';
    if (title.length > 200) return 'Title is too long.';
    if (!dateRaw) return 'Select a date.';
    if (!timeRaw) return 'Select a time.';
    if (!durationRaw) return 'Select a duration.';

    const date = new Date(String(dateRaw));
    const [h, m] = String(timeRaw).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return 'Invalid time.';

    date.setHours(h);
    date.setMinutes(m);

    if (Number.isNaN(date.getTime())) return 'Invalid date or time.';
    if (date < new Date()) return 'Meeting must be scheduled in the future.';

    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const form = e.currentTarget;

    form.reset();
    setTitle('');
    setDescription('');
    setDate(null);
    setTime('');
    setDuration('');

    startTransition(async () => {
      try {
        await createMeeting(formData);

        notifications.show({
          title: 'Meeting Created',
          message: 'Your meeting has been successfully created!',
          color: 'green',
        });
      } catch (err) {
        if (err instanceof Error) {
          const map: Record<string, string> = {
            ERROR_NO_TITLE: 'Title is required.',
            ERROR_TITLE_TOO_LONG: 'Title is too long.',
            ERROR_DESCRIPTION_TOO_LONG: 'Description is too long.',
            ERROR_INVALID_DATE: 'Invalid date.',
            ERROR_MISSING_DATE: 'Please select a date.',
            ERROR_INVALID_TIME: 'Invalid time.',
            ERROR_MISSING_TIME: 'Please choose a time.',
            ERROR_CANNOT_CREATE_MEETING_IN_THE_PAST: 'Meeting must be in the future.',
            ERROR_UNAUTHORIZED: 'You are not authorized.',
            ERROR_USER_HAS_NO_COMMUNITY: 'You are not assigned to a community.',
            ERROR_DB_INSERT_FAILED: 'Failed to save the meeting.',
            ERROR_FETCHING_PROFILE: 'Cannot load user profile.',
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
            title: 'Error',
            message: 'An unexpected error occurred. Please try again later.',
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
      style={{ width: '100%', maxWidth: 650, margin: '0 auto', position: 'relative' }}
    >
      <LoadingOverlay visible={isPending} zIndex={20} />

      <Title order={2} mb="lg">
        Create a Meeting
      </Title>

      {error && (
        <Text c="red" mb="sm" size="sm">
          {error}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            name="title"
            label="Title"
            placeholder="Write the meeting title..."
            leftSection={<FileText size={18} />}
            radius="md"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            name="description"
            label="Description"
            placeholder="Write a description..."
            radius="md"
            minRows={2}
            leftSection={<FileText size={16} />}
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
          />

          <DatePickerInput
            name="date"
            label="Select date"
            placeholder="Select a date"
            radius="md"
            leftSection={<Calendar size={16} />}
            required
            value={date}
            onChange={setDate}
          />
          <TimeInput
            name="time"
            label="Choose a start time"
            placeholder="00:00"
            radius="md"
            leftSection={<Clock size={16} />}
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        <Select
            name="duration" 
            label="Duration" 
            placeholder="Select duration" 
            radius="md"
            required 
            data={[
              { value: '1 hour', label: '1 hour' },
              { value: '1.5 hours', label: '1.5 hours' },
              { value: '2 hours', label: '2 hours' },
              { value: '2.5 hours', label: '2.5 hours' },
            ]}
            value={duration}
            onChange={(value) => setDuration(value!)}
          />

          <Group justify="flex-end" mt="sm">
            <Button type="submit" radius="md" size="md">
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
