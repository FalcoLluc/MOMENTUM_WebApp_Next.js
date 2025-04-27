'use client';

import { Title, Container, Stack } from '@mantine/core';
import { ChangePasswordForm } from '@/components';


export default function SettingsPage() {
  return (
    <Container size="sm">
      <Title order={2} mb="md">
        Settings
      </Title>
      <Stack>
        <ChangePasswordForm />
      </Stack>
    </Container>
  );
}
