'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Flex, Divider, Group, Text, Badge } from '@mantine/core';
import NoticeCard from '@/components/NoticeCard';
import MeetingCard from '@/components/MeetingCard';
import { getNotices, getMeetings,deletePastMeetings  } from './actions';
import { Notice } from '@/types/Notice';
import { Meeting } from '@/types/Meeting';
import FiltersNotices from '@/components/FiltersNotices';

export default function AdminNoticesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const initialPage = Number(pageParam) || 1;

  const category = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as 'newest' | 'oldest') ?? 'newest';

  const [page, setPage] = useState(initialPage);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [count, setCount] = useState(0);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const itemsPerPage = 3; //sina muuta voime kus palju lehel naitame teadet

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  const handleUpdateNotice = (
    id: string,
    values: { title: string; content: string; category: string }
  ) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, ...values } : n)));
  };

  const handleDeleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setCount((prev) => prev - 1);

    if (notices.length === 1 && page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      router.push(buildPageUrl(newPage));
      const { data } = await getNotices(newPage, itemsPerPage, category, sort);
      setNotices(data);
      return;
    }

    //
    const currentLength = notices.length;
    if (currentLength - 1 < itemsPerPage && page * itemsPerPage < count) {
      const { data } = await getNotices(page, itemsPerPage, category, sort);
      setNotices(data);
    }
  };

  const handleUpdateMeeting = (
    id: string,
    values: { title: string; description: string; meeting_date: string; duration: string }
  ) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...values } : m)));
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  //for update functionality after changing the category of notices
  const refetchNotices = async () => {
    const { data, count } = await getNotices(page, itemsPerPage, category, sort);
    setNotices(data);
    setCount(count);
  };

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      await deletePastMeetings();////

      const { data, count } = await getNotices(page, itemsPerPage, category, sort);
      setNotices(data);
      setCount(count);

      const meetingsData = await getMeetings();
      setMeetings(meetingsData);
    }
    fetchData();
  }, [page, category, sort]);

  const totalPages = Math.ceil(count / itemsPerPage);

  return (
    <Flex justify="center" align="flex-start" gap="lg" mt="lg" px="md">
      {/* NOTICES */}
      <Group style={{ flex: 1, minWidth: 320, maxWidth: 500 }} align="flex-start">
        <Flex justify="space-between" align="center" w="100%">
          <Text size="xl" fw={700}>
            Notices
          </Text>
          <FiltersNotices />
        </Flex>
        <Flex gap="xs" mt={-4} justify="flex-end" align="center" w="100%">
          <Badge
            color="blue"
            variant="light"
            radius="xl"
            size="sm"
            styles={{ root: { paddingLeft: 12, paddingRight: 12 } }}
          >
            {category === '' ? 'All' : category}
          </Badge>
          <Badge
            color="blue"
            variant="light"
            radius="xl"
            size="sm"
            styles={{ root: { paddingLeft: 12, paddingRight: 12 } }}
          >
            {sort === 'newest' ? 'Newest' : 'Oldest'}
          </Badge>
        </Flex>

        <Flex direction="column" gap="sm" w="100%">
          {notices.length > 0 ? (
            notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                role="admin"
                onUpdate={(values) => handleUpdateNotice(notice.id, values)}
                onDelete={() => handleDeleteNotice(notice.id)}
                onAfterSave={refetchNotices}
              />
            ))
          ) : (
            <Text size="sm" c="dimmed">
              No notices yet.
            </Text>
          )}

          {/* Pagination */}
          <Group justify="center" mt="md" gap="md">
            {page > 1 && (
              <Text
                fw={600}
                c="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(buildPageUrl(page - 1))}
              >
                ← Previous
              </Text>
            )}
            <Text>
              {page} / {totalPages}
            </Text>
            {page < totalPages && (
              <Text
                fw={600}
                c="blue"
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(buildPageUrl(page + 1))}
              >
                Next →
              </Text>
            )}
          </Group>
        </Flex>
      </Group>

      <Divider orientation="vertical" color="#e9ecef" />

      {/* MEETINGS */}
      <Group style={{ flex: 1, minWidth: 320, maxWidth: 500 }}>
        <Text size="xl" fw={700}>
          Meetings
        </Text>
        <Flex direction="column" gap="sm" mt="sm" w="100%">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                role="admin"
                onUpdate={(values) => handleUpdateMeeting(meeting.id, values)}
                onDelete={() => handleDeleteMeeting(meeting.id)}
              />
            ))
          ) : (
            <Text size="sm" c="dimmed">
              No meetings yet.
            </Text>
          )}
        </Flex>
      </Group>
    </Flex>
  );
}
