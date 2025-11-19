import { Container, Title, Text } from '@mantine/core';

export default function ResidentNoticesPage() {
  return (
    <Container size="lg" py="lg">
      <Title order={2}>Notices</Title>
      <Text mt="sm" c="dimmed">
        This is the resident notices page. Later you can list all notices from your association here.
      </Text>
    </Container>
  );
}
