import { Meeting } from '@/types/Meeting';
import { Card, Text, Badge, Group, Avatar, Button } from '@mantine/core';
import { Calendar, Clock, Pencil, Trash } from 'lucide-react';

interface Props {
  meeting: Meeting;
}

export default function MeetingCard({ meeting }: Props) {
  const formattedDate = new Date(meeting.meeting_date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(meeting.meeting_date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
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
          1 hour
        </Badge>
      </Group>

      <Text fw={600} size="md" mb={4}>
        {meeting.title}
      </Text>

      <Text size="sm" c="dimmed" lh={1.5}>
        {meeting.description}
      </Text>
      <Group justify="flex-end" mt="md">
        <Button
          variant="light"
          color="blue"
          radius="xl"
          size="compact-sm"
          leftSection={<Pencil size={14} />}
        >
          Edit
        </Button>
        <Button
          variant="light"
          color="red"
          radius="xl"
          size="compact-sm"
          leftSection={<Trash size={14} />}
        >
          Delete
        </Button>
      </Group>
    </Card>
  );
}
