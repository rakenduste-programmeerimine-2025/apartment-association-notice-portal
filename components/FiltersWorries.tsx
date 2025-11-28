'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Menu, Button } from '@mantine/core';
import { Funnel, Check, ListFilter } from 'lucide-react';

export default function FiltersWorries() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Menu width={220} position="bottom-end" shadow="md" radius="md">
      <Menu.Target>
        <Button variant="outline" color="blue" size="sm" leftSection={<Funnel size={16} />}>
          Filters
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label style={{ fontSize: 13, opacity: 0.8 }}>Sort by date</Menu.Label>

        <Menu.Item
          leftSection={<ListFilter size={16} />}
          rightSection={currentSort === 'newest' ? <Check size={16} color="#1c7ed6" /> : null}
          onClick={() => handleSort('newest')}
          style={{ fontWeight: currentSort === 'newest' ? 600 : 400 }}
        >
          Newest
        </Menu.Item>

        <Menu.Item
          leftSection={<ListFilter size={16} />}
          rightSection={currentSort === 'oldest' ? <Check size={16} color="#1c7ed6" /> : null}
          onClick={() => handleSort('oldest')}
          style={{ fontWeight: currentSort === 'oldest' ? 600 : 400 }}
        >
          Oldest
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
