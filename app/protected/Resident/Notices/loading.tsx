'use client';

import { Center, Loader } from '@mantine/core';

export default function ResidentNoticesLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}
    >
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    </div>
  );
}
