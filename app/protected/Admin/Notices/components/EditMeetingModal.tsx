'use client';

import { Modal, TextInput, Textarea, Button, Stack, Group,Select  } from '@mantine/core';
import { useState } from 'react';
import type { Meeting } from '@/types/Meeting';
import { Type, FileText, CalendarClock, Check } from 'lucide-react';

interface Props {
  opened: boolean;
  onClose: () => void;
  meeting: Meeting;
  onSubmit: (values: {
    title: string;
    description: string;
    meeting_date: string;
    duration: string;
  }) => Promise<void> | void;
}

export default function EditMeetingModal({ opened, onClose, meeting, onSubmit }: Props) {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description);
  const [meetingDate, setMeetingDate] = useState(formatDate(meeting.meeting_date));
  const [duration, setDuration] = useState(meeting.duration || '');
  const isDateValid = !isNaN(new Date(meetingDate).getTime());
  const isFormValid =
    title.trim() !== '' && description.trim() !== '' && meetingDate !== '' && duration.trim() !== '' && isDateValid;

  const handleSave = async () => {
    await onSubmit({ title, description, meeting_date: meetingDate,duration });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Meeting" centered size="lg">
      <Stack gap="md">
        <TextInput
          label="Title"
          leftSection={<Type size={16} />}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
        />

        <Textarea
          label="Description"
          leftSection={<FileText size={16} />}
          autosize
          minRows={2}
          maxRows={6}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        <TextInput
          label="Meeting date"
          leftSection={<CalendarClock size={16} />}
          type="datetime-local"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          error={!isDateValid ? 'Invalid date' : undefined}
        />
        <Select
          label="Duration"
          placeholder="Select duration"
          data={['1 hour', '1.5 hours', '2 hours', '2.5 hours']}
          value={duration}
          onChange={(val) => setDuration(val!)}
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>

          <Button leftSection={<Check size={16} />} onClick={handleSave} disabled={!isFormValid}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
