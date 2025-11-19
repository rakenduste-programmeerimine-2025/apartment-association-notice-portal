'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  ScrollArea,
} from '@mantine/core';
import { Button } from '@/components/ui/button';

type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  created_by: string | null;
  community_id: string | number | null;
};

const supabase = createClient();

export default function AdminWorriesPage() {
  const [worries, setWorries] = useState<Worry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorries = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('worries')
        .select('id, title, content, created_at, created_by, community_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching worries:', error.message);
        setWorries([]);
      } else {
        setWorries((data || []) as Worry[]);
      }

      setLoading(false);
    };

    fetchWorries();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this worry?',
    );
    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase.from('worries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting worry:', error.message);
    } else {
      setWorries((prev) => prev.filter((worry) => worry.id !== id));
    }

    setDeletingId(null);
  };

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
          Resident worries
        </Text>

        {worries.length === 0 && (
          <Text c="dimmed" size="sm">
            No worries have been submitted yet.
          </Text>
        )}

        {worries.map((worry) => (
          <Card key={worry.id} withBorder shadow="sm" radius="md">
            <Group justify="space-between" align="flex-start" mb="xs">
              <Stack gap={2}>
                <Text fw={600}>{worry.title || 'Untitled worry'}</Text>

                <Text size="sm" c="dimmed">
                  {worry.created_by
                    ? `Created by ${worry.created_by}`
                    : 'Created by resident'}
                </Text>

                <Text size="xs" c="dimmed">
                  {new Date(worry.created_at).toLocaleString()}
                </Text>
              </Stack>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(worry.id)}
                disabled={deletingId === worry.id}
              >
                {deletingId === worry.id ? 'Deleting…' : 'Delete'}
              </Button>
            </Group>

            {worry.content && (
              <Text size="sm" mt="xs">
                {worry.content}
              </Text>
            )}
          </Card>
        ))}
      </Stack>
    </ScrollArea>
  );
}
