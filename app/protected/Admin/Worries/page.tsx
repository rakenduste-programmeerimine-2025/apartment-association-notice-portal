'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  Text,
  Group,
  Stack,
  ScrollArea,
  Flex,
  Badge,
  LoadingOverlay,
} from '@mantine/core';
import { getWorries } from './actions';
import type { Worry } from '@/types/Worry';
import FiltersWorries from '@/components/FiltersWorries';
import DeleteButtonWorry from '@/app/protected/Admin/Worries/components/DeleteButtonWorry';

export default function AdminWorriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const initialPage = Number(pageParam) || 1;
  const sort = searchParams.get('sort') || 'newest';

  const [page, setPage] = useState(initialPage);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [count, setCount] = useState(0);

  const [actionLoading, setActionLoading] = useState(false);

  const itemsPerPage = 3;

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  const fetchWorries = useCallback(
    async (pageToLoad = page) => {
      setActionLoading(true);
      try {
        const { data, count } = await getWorries(
          pageToLoad,
          itemsPerPage,
          sort as 'newest' | 'oldest'
        );
        setWorries(data);
        setCount(count);
      } catch (error) {
        console.error('Error fetching worries:', error);
        setWorries([]);
        setCount(0);
      } finally {
        setActionLoading(false);
      }
    },
    [page, sort, itemsPerPage]
  );

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    fetchWorries();
  }, [fetchWorries]);

  const handleAfterDelete = async (deletedId: string) => {
    // same behavior as before: handle last item on page
    if (worries.length === 1 && page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      router.push(buildPageUrl(newPage));
      await fetchWorries(newPage);
    } else {
      await fetchWorries();
    }
  };

  const totalPages = Math.ceil(count / itemsPerPage);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Overlay */}
      <LoadingOverlay
        visible={actionLoading}
        zIndex={2000}
        loaderProps={{ size: 'xl', variant: 'bars', color: 'blue' }}
      />

      <ScrollArea style={{ maxHeight: 'calc(100vh - 80px)' }} px="md" py="lg">
        <Stack gap="md">
          <Flex justify="space-between" align="center" w="100%">
            <Text size="xl" fw={700}>
              Resident worries
            </Text>
            <FiltersWorries />
          </Flex>

          <Flex gap="xs" mt={-4} justify="flex-end" align="center" w="100%">
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

          {worries.length === 0 && !actionLoading && (
            <Text c="dimmed" size="sm">
              No worries have been submitted yet.
            </Text>
          )}

          {worries.map((worry) => {
            const date = new Date(worry.created_at + 'Z');
            const formattedDate = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return (
              <Card key={worry.id} withBorder shadow="sm" radius="md">
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Stack gap={2}>
                    <Text fw={600}>{worry.title || 'Untitled worry'}</Text>

                    <Text size="sm" c="dimmed">
                      {worry.creator_name
                        ? `Created by ${worry.creator_name}`
                        : 'Created by resident'}
                    </Text>

                    <Text size="xs" c="dimmed">
                      {formattedDate}, {formattedTime}
                    </Text>

                    <Text size="xs" c="dimmed">
                      Likes: {worry.likesCount ?? 0}
                    </Text>
                  </Stack>

                  <DeleteButtonWorry
                    id={worry.id}
                    onDeleted={() => handleAfterDelete(worry.id)}
                  />
                </Group>

                {worry.content && (
                  <Text size="sm" mt="xs">
                    {worry.content}
                  </Text>
                )}
              </Card>
            );
          })}

          {worries.length > 0 && (
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
          )}
        </Stack>
      </ScrollArea>
    </div>
  );
}
