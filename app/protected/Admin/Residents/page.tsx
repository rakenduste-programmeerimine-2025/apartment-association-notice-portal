'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, Text, Group, Stack, Loader, Center, ScrollArea, Badge, Avatar } from '@mantine/core';
import { Button } from '@/components/ui/button';
import type { CommunityId } from '@/types/community';
import { removeResidentAction } from './actions';

type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'resident' | null;
  community_id: CommunityId | null;
  flat_number: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected' | null;
};

const supabase = createClient();

// Read community_id from env so each developer / environment can configure it
const COMMUNITY_ID: CommunityId | '' =
  (process.env.NEXT_PUBLIC_COMMUNITY_ID as CommunityId | undefined) ?? '';

export default function AdminResidentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        let query = supabase
          .from('users')
          .select('id, email, full_name, role, community_id, flat_number, created_at, status')
          .order('created_at', { ascending: false });
        //  If COMMUNITY_ID is set, filter by it
        if (COMMUNITY_ID) {
          query = query.eq('community_id', COMMUNITY_ID);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching users:', error.message);
          setUsers([]);
        } else {
          setUsers((data || []) as User[]);
        }
      } catch (err) {
        console.error(err);
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

  const removeResident = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this resident?');
    if (!confirmed) return;

    setUpdatingId(id);

    try {
      await removeResidentAction(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
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
    //scrollarea(kõrgus) is muudetud selleks et scrolimine yldse töötaks,nyyd töötab
    <ScrollArea h="100vh" px="md" py="lg">
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
                {/* Avatar + info */}
                <Group align="center" gap="md">
                  <Avatar color="gray" radius="xl">
                    {initials(user.full_name)}
                  </Avatar>
                  {/* värv sinna saab muuta  */}
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

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeResident(user.id)}
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
                {/* Avatar + info */}
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
