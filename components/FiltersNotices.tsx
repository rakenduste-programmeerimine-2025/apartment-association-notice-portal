'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Menu, Button, Badge, Group } from '@mantine/core';
import { Funnel, Check, Wrench, Shield, FolderKanban, ListFilter } from 'lucide-react';

export default function FiltersNotices() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null) params.delete(key);
    else params.set(key, value);

    params.delete('page');

    router.push(`?${params.toString()}`);
  };

  const MenuItem = (
    label: string,
    value: string | null,
    icon: React.ReactNode,
    active: boolean,
    key: string
  ) => (
    <Menu.Item
      onClick={() => updateFilter(key, value)}
      leftSection={icon}
      rightSection={active ? <Check size={16} color="#1c7ed6" /> : null}
      style={{
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </Menu.Item>
  );

  return (
    <Menu width={220} position="bottom-end" shadow="md" radius="md">
      <Menu.Target>
        <Button variant="outline" color="blue" size="sm" leftSection={<Funnel size={16} />}>
          Filters
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label style={{ fontSize: 13, opacity: 0.8 }}>Category</Menu.Label>

        {MenuItem('All', null, <ListFilter size={16} />, currentCategory === '', 'category')}
        {MenuItem(
          'Maintenance',
          'Maintenance',
          <Wrench size={16} />,
          currentCategory === 'Maintenance',
          'category'
        )}
        {MenuItem(
          'Safety',
          'Safety',
          <Shield size={16} />,
          currentCategory === 'Safety',
          'category'
        )}
        {MenuItem(
          'General',
          'General',
          <FolderKanban size={16} />,
          currentCategory === 'General',
          'category'
        )}

        <Menu.Divider />

        <Menu.Label style={{ fontSize: 13, opacity: 0.8 }}>Sort by date</Menu.Label>

        {MenuItem(
          'Newest first',
          'newest',
          <ListFilter size={16} />,
          currentSort === 'newest',
          'sort'
        )}
        {MenuItem(
          'Oldest first',
          'oldest',
          <ListFilter size={16} />,
          currentSort === 'oldest',
          'sort'
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
