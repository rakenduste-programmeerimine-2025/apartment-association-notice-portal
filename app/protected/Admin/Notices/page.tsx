import { Flex, Divider, Group, Text } from '@mantine/core';
import NoticeCard from '@/components/NoticeCard';
import MeetingCard from '@/components/MeetingCard';
import { getNotices, getMeetings } from './actions';
import { Notice } from '@/types/Notice';
import { Meeting } from '@/types/Meeting';


export default async function AdminNoticesPage() {
  const notices: Notice[] = await getNotices();
  const meetings: Meeting[] = await getMeetings();

  return (
    <>
      <Flex justify="center" align="flex-start" gap="lg" mt="lg" px="md">
        <Group style={{ flex: 1, minWidth: 320, maxWidth: 500 }} align="flex-start">
          <Text size="xl" fw={700}>
            Notices
          </Text>

          <Flex direction="column" gap="sm" mt="sm" w="100%">
            {notices && notices.length > 0 ? (
              notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
            ) : (
              <Text size="sm" c="dimmed">
                No notices yet.
              </Text>
            )}
          </Flex>
        </Group>

        <Divider orientation="vertical" color="#e9ecef" />

        <Group style={{ flex: 1, minWidth: 320, maxWidth: 500 }}>
          <Text size="xl" fw={700}>
            Meetings
          </Text>
          <Flex direction="column" gap="sm" mt="sm" w="100%">
            {meetings && meetings.length > 0 ? (
              meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
            ) : (
              <Text size="sm" c="dimmed">
                No meetings yet.
              </Text>
            )}
          </Flex>
        </Group>
      </Flex>
    </>
  );
}
