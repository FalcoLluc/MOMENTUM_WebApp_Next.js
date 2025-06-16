'use client';

import { useAuthStore } from '@/stores/authStore';
import {
  Avatar,
  Card,
  Center,
  Divider,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';

export default function UserAccountPage() {
  const worker = useAuthStore((state) => state.worker);

  if (!worker) {
    return (
      <Card shadow="sm" padding="lg" radius="md" style={{ maxWidth: 500, margin: '0 auto', marginTop: 40, position: 'relative' }}>
        <LoadingOverlay visible />
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 500, margin: '0 auto', marginTop: 40 }}>
      <Center mb="md">
        <Avatar color="cyan" size={80} radius="xl">
          <IconBriefcase size="2.5rem" />
        </Avatar>
      </Center>

      <Stack gap="xs" align="center" mb="md">
        <Title order={3}>{worker.name}</Title>
        <Text size="sm" c="dimmed">
          {worker.mail}
        </Text>
      </Stack>

      <Divider my="sm" />

      <Stack gap="xs">
        <Text>
          <strong>Age:</strong> {worker.age}
        </Text>
        <Text>
          <strong>Role:</strong> {worker.role}
        </Text>
      </Stack>
    </Card>
  );
}
