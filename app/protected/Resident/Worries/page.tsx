import { Container, Title, Text } from '@mantine/core';

export default function ResidentWorriesPage() {
  return (
    <Container size="lg" py="lg">
      <Title order={2}>Worries</Title>
      <Text mt="sm" c="dimmed">
        This is the page where you will see the concerns.
      </Text>
    </Container>
  );
}
