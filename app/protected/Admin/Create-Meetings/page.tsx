'use client';

import { Flex } from '@mantine/core';
import CreateMeetingForm from './components/CreateMeetingForm';

export default function CreateMeetingsPage() {
  return (
    <Flex
      justify="center"
      style={{
        paddingTop: '3rem'
      }}
    >
      <CreateMeetingForm />
    </Flex>
  );
}
