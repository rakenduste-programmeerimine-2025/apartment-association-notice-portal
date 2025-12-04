'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  Text,
  Stack,
  ScrollArea,
  Badge,
  Flex,
  Group,
  LoadingOverlay,
  Button,
} from '@mantine/core';
import FiltersWorries from '@/components/FiltersWorries';
import type { Worry } from '@/types/Worry';

const supabase = createClient();

export default function ResidentWorriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const initialPage = Number(pageParam) || 1;
  const sort = searchParams.get('sort') || 'newest';

  const [page, setPage] = useState(initialPage);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [count, setCount] = useState(0);

  const [actionLoading, setActionLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const itemsPerPage = 3;

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  const handleToggleLike = async (worryId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const target = worries.find((w) => w.id === worryId);
      if (!target) return;

      const alreadyLiked = !!target.hasLiked;

      if (alreadyLiked) {
        const { error } = await supabase
          .from('likesworry')
          .delete()
          .eq('worry_id', worryId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking worry:', error);
          return;
        }

        setWorries((prev) =>
          prev.map((w) =>
            w.id === worryId
              ? {
                  ...w,
                  hasLiked: false,
                  likesCount: Math.max((w.likesCount ?? 1) - 1, 0),
                }
              : w
          )
        );
      } else {
        const { error } = await supabase.from('likesworry').insert({
          worry_id: worryId,
          user_id: user.id,
        });

        if (error) {
          console.error('Error liking worry:', error);
          return;
        }

        setWorries((prev) =>
          prev.map((w) =>
            w.id === worryId
              ? {
                  ...w,
                  hasLiked: true,
                  likesCount: (w.likesCount ?? 0) + 1,
                }
              : w
          )
        );
      }
    } catch (err) {
      console.error('Error toggling worry like:', err);
    }
  };

  useEffect(() => {
    const fetchWorries = async () => {
      setActionLoading(true);

      try {
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setWorries([]);
          setCount(0);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('community_id')
          .eq('id', user.id)
          .single();

        if (!profile?.community_id) {
          setWorries([]);
          setCount(0);
          return;
        }

        const { data, error, count } = await supabase
          .from('worries')
          .select(
            `
            id,
            title,
            content,
            created_at,
            likesworry (
              id,
              user_id
            )
          `,
            { count: 'exact' }
          )
          .eq('community_id', profile.community_id)
          .order('created_at', { ascending: sort === 'oldest' })
          .range(from, to);

        if (error) {
          let errorMessage = 'Unknown error';
          try {
            errorMessage =
              typeof error.message === 'string' ? error.message : JSON.stringify(error);
          } catch {
            errorMessage = 'Error parsing Supabase error';
          }
          console.error('Error fetching resident worries:', errorMessage);

          setWorries([]);
          setCount(0);
        } else {
          const mapped: Worry[] =
            (data || []).map((row: any) => {
              const likes = row.likesworry ?? [];
              const likesCount = likes.length;
              const hasLiked = likes.some((l: any) => l.user_id === user.id);
              const { likesworry, ...rest } = row;
              return { ...rest, likesCount, hasLiked } as Worry;
            });

          setWorries(mapped);
          setCount(count || 0);
        }
      } catch (err) {
        console.error('Unexpected error fetching resident worries:', err);
        setWorries([]);
        setCount(0);
      } finally {
        setActionLoading(false);
        setInitialLoading(false);
      }
    };

    fetchWorries();
  }, [sort, page]);

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

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
              Worries
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

          {!actionLoading && !initialLoading && worries.length === 0 && (
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
                <Text fw={600}>{worry.title || 'Untitled worry'}</Text>

                {worry.content && (
                  <Text size="sm" mt="xs">
                    {worry.content}
                  </Text>
                )}

                <Group justify="space-between" mt="xs" align="center">
                  <Text size="xs" c="dimmed">
                    {formattedDate}, {formattedTime}
                  </Text>
                  <Button
                    size="xs"
                    variant={worry.hasLiked ? 'filled' : 'outline'}
                    onClick={() => handleToggleLike(worry.id)}
                  >
                    {worry.hasLiked ? 'Unlike' : 'Like'} · {worry.likesCount ?? 0}
                  </Button>
                </Group>
              </Card>
            );
          })}

          {/* Pagination */}
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
