import { Container, Title, Text } from '@mantine/core';

export default function CreateWorryPage() {
  return (
    <Container size="lg" py="lg">
      <Title order={2}>Create worry</Title>
      <Text mt="sm" c="dimmed">
        Here you will be able to create worries
      </Text>
    </Container>
  );
}
