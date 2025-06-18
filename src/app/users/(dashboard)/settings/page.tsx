'use client';

import { Title, Container, Stack } from '@mantine/core';
import { ChangePasswordForm } from '@/components';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';


export default function SettingsPage() {
  return (
    <Container size="sm">
      <Title order={2} mb="md">
        Settings
      </Title>
      <Stack>
        <ThemeSwitch />
        <ChangePasswordForm />
      </Stack>
    </Container>
  );
}
