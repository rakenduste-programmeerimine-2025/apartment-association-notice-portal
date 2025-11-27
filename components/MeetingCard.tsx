'use client';

import { useState } from 'react';
import DeleteButtonMeeting from '@/app/protected/Admin/Notices/components/DeleteButtonMeeting';
import EditButtonMeeting from '@/app/protected/Admin/Notices/components/EditButtonMeeting';
import EditMeetingModal from '@/app/protected/Admin/Notices/components/EditMeetingModal';
import { updateMeeting, deleteMeeting } from '@/app/protected/Admin/Notices/actions';
import { Meeting } from '@/types/Meeting';
import { Card, Text, Badge, Group } from '@mantine/core';
import { Calendar, Clock } from 'lucide-react';

interface Props {
  meeting: Meeting;
  role?: 'admin' | 'resident';
  onUpdate?: (values: { title: string; description: string; meeting_date: string; duration: string }) => void; // <- добавлено
  onDelete?: () => void; 
}

export default function MeetingCard({ meeting, role, onUpdate, onDelete }: Props) {
  const [opened, setOpened] = useState(false);

  const formattedDate = new Date(meeting.meeting_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(meeting.meeting_date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  
  const handleUpdate = async (values: {
    title: string;
    description: string;
    meeting_date: string;
    duration: string;
  }) => {
    await updateMeeting(meeting.id, values);
    onUpdate?.(values); 
  };

  const handleDelete = async () => {
    await deleteMeeting(meeting.id);
    onDelete?.(); 
  };

  return (
    <>
      <Card radius="lg" padding="lg" withBorder style={{ maxWidth: 600, margin: '40xpx auto' }}>
        <Group justify="space-between" mb="xs" align="center">
          <Group gap={10}>
            <Badge color="blue" size="md" variant="light" leftSection={<Calendar size={12} />}>
              {formattedDate}
            </Badge>
            <Badge color="blue" size="md" variant="light" leftSection={<Clock size={12} />}>
              {formattedTime}
            </Badge>
          </Group>

          <Badge color="blue" size="md" variant="dot">
            {meeting.duration}
          </Badge>
        </Group>

        <Text fw={600} size="md" mb={4}>
          {meeting.title}
        </Text>

        <Text size="sm" c="dimmed" lh={1.5}>
          {meeting.description}
        </Text>

        {role === 'admin' && (
          <Group justify="flex-end" mt="md">
            <EditButtonMeeting id={meeting.id} onClick={() => setOpened(true)} />
            <DeleteButtonMeeting id={meeting.id} onClick={handleDelete} />
          </Group>
        )}
      </Card>

      <EditMeetingModal
        opened={opened}
        onClose={() => setOpened(false)}
        meeting={meeting}
        onSubmit={handleUpdate} 
      />
    </>
  );
}
