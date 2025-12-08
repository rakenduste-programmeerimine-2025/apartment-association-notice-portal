'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  ScrollArea,
  Badge,
  Avatar,
  LoadingOverlay,
} from '@mantine/core';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { getResidents, removeResidentAction, type AdminResident } from './actions';
import DeleteResidentButton from './components/DeleteResidentButton';

const supabase = createClient();

type User = AdminResident;

export default function AdminResidentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const { data } = await getResidents(1, 200, 'newest');
        setUsers(data);
      } catch (err) {
        console.error('Error fetching residents:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateStatus = async (id: string, status: 'approved') => {
    setUpdatingId(id);

    const { error } = await supabase.from('users').update({ status }).eq('id', id);

    if (error) {
      console.error('Error updating user status:', error.message);
    } else {
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)));
    }

    setUpdatingId(null);
  };

  const admins = users.filter((u) => u.role === 'admin');
  const pendingResidents = users.filter((u) => u.role === 'resident' && u.status === 'pending');
  const approvedResidents = users.filter((u) => u.role === 'resident' && u.status === 'approved');

  const initials = (fullName: string | null) =>
    fullName
      ? fullName
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase()
      : 'U';

  return (
    <ScrollArea h="100vh" px="md" py="lg">
      <Stack gap="xl">
        <LoadingOverlay
          visible={loading || updatingId !== null}
          zIndex={20}
          loaderProps={{ size: 'xl', variant: 'bars', color: 'blue' }}
        />

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
                <Group align="center" gap="md">
                  <Avatar color="gray" radius="xl">
                    {initials(user.full_name)}
                  </Avatar>
                  <Stack gap={2}>
                    <Text fw={600}>{user.full_name || 'Unnamed resident'}</Text>
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
                </Group>

                <Group gap="sm">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateStatus(user.id, 'approved')}
                    disabled={updatingId === user.id}
                  >
                    Approve
                  </Button>

                  <DeleteResidentButton
                    id={user.id}
                    mode="reject"
                    onDone={() =>
                      setUsers((prev) => prev.filter((u) => u.id !== user.id))
                    }
                  />
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
                <Group align="center" gap="md">
                  <Avatar color="blue" radius="xl">
                    {initials(user.full_name)}
                  </Avatar>

                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={600}>{user.full_name || 'Unnamed resident'}</Text>
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
                      Member since: {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Group>

                <DeleteResidentButton
                  id={user.id}
                  mode="remove"
                  onDone={() =>
                    setUsers((prev) => prev.filter((u) => u.id !== user.id))
                  }
                />
              </Group>
            </Card>
          ))}
        </Stack>

        {/* Admins */}
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
                <Group align="center" gap="md">
                  <Avatar
                    radius="xl"
                    color="blue"
                    styles={{
                      root: {
                        fontWeight: 700,
                        border: '2px solid #2B6CB0',
                      },
                    }}
                  >
                    {initials(user.full_name)}
                  </Avatar>

                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text fw={600}>{user.full_name || 'Unnamed admin'}</Text>
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
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </ScrollArea>
  );
}
