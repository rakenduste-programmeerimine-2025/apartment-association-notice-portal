'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, Text, Stack, Loader, Center, ScrollArea, Badge, Flex } from '@mantine/core';
import FiltersWorries from '@/components/FiltersWorries';

type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  // created_by ja community_id on olemas tabelis, aga kasutaja vaates ei pea neid ilmtingimata näitama
};

const supabase = createClient();

export default function ResidentWorriesPage() {
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'newest';

  const [worries, setWorries] = useState<Worry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorries = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('worries')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: sort === 'oldest' });
      if (error) {
        console.error('Error fetching resident worries:', error.message);
        setWorries([]);
      } else {
        setWorries((data || []) as Worry[]);
      }

      setLoading(false);
    };

    fetchWorries();
  }, [sort]);

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
      </Stack>
    </ScrollArea>
  );
}
