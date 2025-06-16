'use client';

import { useAuthStore } from '@/stores/authStore';
import {
  Avatar,
  Card,
  Paper,
  Stack,
  Text,
  Title,
  LoadingOverlay,
  Divider,
  Center,
} from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

export default function UserAccountPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <Paper shadow="sm" p="md" radius="md" style={{ position: 'relative', minHeight: 200 }}>
        <LoadingOverlay visible />
      </Paper>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 500, margin: '0 auto', marginTop: 40 }}>
      <Center mb="md">
        <Avatar color="blue" size={80} radius="xl">
          <IconUser size="2.5rem" />
        </Avatar>
      </Center>

      <Stack gap="xs" align="center" mb="md">
        <Title order={3}>{user.name}</Title>
        <Text size="sm" c="dimmed">
          {user.mail}
        </Text>
      </Stack>

      <Divider my="sm" />

      <Stack gap="xs">
        <Text>
          <strong>Age:</strong> {user.age}
        </Text>
        <Text>
          <strong>Followers:</strong> {user.followers?.length || 0}
        </Text>
        <Text>
          <strong>Following:</strong> {user.following?.length || 0}
        </Text>
      </Stack>
    </Card>
  );
}
