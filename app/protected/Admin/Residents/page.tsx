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
  Badge,
} from '@mantine/core';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'resident' | null;
  community_id: string | null;
  flat_number: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | null;
};

const supabase = createClient();

export default function AdminResidentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('users')
        .select(
          'id, email, full_name, role, community_id, flat_number, created_at, status',
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error.message);
        setUsers([]);
      } else {
        setUsers((data || []) as User[]);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  const updateStatus = async (
    id: string,
    status: 'approved' | 'rejected',
  ) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating user status:', error.message);
    } else {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, status } : user,
        ),
      );
    }

    setUpdatingId(null);
  };

  const removeResident = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this resident?',
    );
    if (!confirmed) return;

    setUpdatingId(id);

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      console.error('Error removing resident:', error.message);
    } else {
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }

    setUpdatingId(null);
  };

  if (loading) {
    return (
      <Center mt="xl">
        <Loader />
      </Center>
    );
  }

  const admins = users.filter((u) => u.role === 'admin');
  const pendingResidents = users.filter(
    (u) => u.role === 'resident' && u.status === 'pending',
  );
  const approvedResidents = users.filter(
    (u) => u.role === 'resident' && u.status === 'approved',
  );

  return (
    <ScrollArea style={{ maxHeight: 'calc(100vh - 80px)' }} px="md" py="lg">
      <Stack gap="xl">
        {/* Pending join requests */}
        <Stack gap="md">
          <Text fw={700} size="xl">
            Pending requests
          </Text>

          {pendingResidents.length === 0 && (
            <Text c="dimmed" size="sm">
              No pending join requests.
            </Text>
          )}

          {pendingResidents.map((user) => (
            <Card key={user.id} withBorder shadow="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fw={600}>
                    {user.full_name || 'Unnamed resident'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>
                  {user.flat_number && (
                    <Text size="sm" c="dimmed">
                      Flat: {user.flat_number}
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">
                    Requested at: {new Date(user.created_at).toLocaleString()}
                  </Text>
                </Stack>

                <Group gap="sm">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateStatus(user.id, 'approved')}
                    disabled={updatingId === user.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => updateStatus(user.id, 'rejected')}
                    disabled={updatingId === user.id}
                  >
                    Reject
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>

        {/* Approved residents */}
        <Stack gap="md">
          <Text fw={700} size="xl">
            Residents
          </Text>

          {approvedResidents.length === 0 && (
            <Text c="dimmed" size="sm">
              No approved residents yet.
            </Text>
          )}

          {approvedResidents.map((user) => (
            <Card key={user.id} withBorder shadow="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={600}>
                      {user.full_name || 'Unnamed resident'}
                    </Text>
                    <Badge size="xs" variant="outline">
                      Resident
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>

                  {user.flat_number && (
                    <Text size="sm" c="dimmed">
                      Flat: {user.flat_number}
                    </Text>
                  )}

                  <Text size="xs" c="dimmed">
                    Member since:{' '}
                    {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </Stack>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeResident(user.id)}
                  disabled={updatingId === user.id}
                >
                  {updatingId === user.id ? 'Removing…' : 'Remove'}
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>

        {/* Admins list (optional but useful) */}
        <Stack gap="md">
          <Text fw={700} size="xl">
            Admins
          </Text>

          {admins.length === 0 && (
            <Text c="dimmed" size="sm">
              No admins found.
            </Text>
          )}

          {admins.map((user) => (
            <Card key={user.id} withBorder shadow="sm" radius="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={600}>
                      {user.full_name || 'Unnamed admin'}
                    </Text>
                    <Badge size="xs" variant="outline">
                      Admin
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {user.email}
                  </Text>

                  <Text size="xs" c="dimmed">
                    Created at: {new Date(user.created_at).toLocaleString()}
                  </Text>
                </Stack>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </ScrollArea>
  );
}
