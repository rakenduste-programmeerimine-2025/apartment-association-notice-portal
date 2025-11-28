'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, Text, Stack, Loader, Center, ScrollArea, Badge, Flex, Group } from '@mantine/core';
import FiltersWorries from '@/components/FiltersWorries';

type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
};

const supabase = createClient();

export default function ResidentWorriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get('page');
  const initialPage = Number(pageParam) || 1;
  const sort = searchParams.get('sort') || 'newest';

  const [page, setPage] = useState(initialPage);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  
  const itemsPerPage = 3;

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  useEffect(() => {
    const fetchWorries = async () => {
      setLoading(true);

      try {
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data: { user } } = await supabase.auth.getUser();
        
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
          .select('id, title, content, created_at', { count: 'exact' })
          .eq('community_id', profile.community_id) 
          .order('created_at', { ascending: sort === 'oldest' })
          .range(from, to);

        if (error) {
          console.error('Error fetching resident worries:', error.message);
          setWorries([]);
          setCount(0);
        } else {
          setWorries((data || []) as Worry[]);
          setCount(count || 0);
        }
      } catch (err) {
        console.error(err);
        setWorries([]);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchWorries();
  }, [sort, page]);

  useEffect(() => {
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  const totalPages = Math.ceil(count / itemsPerPage);

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  return (
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

        {worries.length === 0 && (
          <Text c="dimmed" size="sm">
            No worries have been submitted yet.
          </Text>
        )}

        {worries.map((worry) => (
          <Card key={worry.id} withBorder shadow="sm" radius="md">
            <Text fw={600}>{worry.title || 'Untitled worry'}</Text>

            {worry.content && (
              <Text size="sm" mt="xs">
                {worry.content}
              </Text>
            )}

            <Text size="xs" c="dimmed" mt="xs">
              {new Date(worry.created_at).toLocaleString()}
            </Text>
          </Card>
        ))}

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
  );
}