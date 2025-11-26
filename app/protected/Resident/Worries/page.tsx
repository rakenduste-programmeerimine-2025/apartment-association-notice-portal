'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  Text,
  Stack,
  Loader,
  Center,
  ScrollArea,
} from '@mantine/core';

type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  // created_by ja community_id on olemas tabelis, aga kasutaja vaates ei pea neid ilmtingimata näitama
};

const supabase = createClient();

export default function ResidentWorriesPage() {
  const [worries, setWorries] = useState<Worry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorries = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('worries')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resident worries:', error.message);
        setWorries([]);
      } else {
        setWorries((data || []) as Worry[]);
      }

      setLoading(false);
    };

    fetchWorries();
  }, []);

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
        <Text fw={700} size="xl">
          Worries
        </Text>

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
