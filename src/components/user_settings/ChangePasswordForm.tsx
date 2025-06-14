// components/user_settings/ChangePasswordForm.tsx
'use client';

import { useState } from 'react';
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  Paper,
  Group,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

export function ChangePasswordForm() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'New passwords do not match',
      });
      return;
    }

    setLoading(true);
    try {
      if (!user?._id) {
        notifications.show({
          color: 'red',
          title: 'Error',
          message: 'User ID is missing. Please try again.',
        });
        return;
      }

      await authService.updateUserPassword(user._id, {
        currentPassword,
        newPassword,
      });
      notifications.show({
        color: 'green',
        title: 'Success',
        message: 'Password updated successfully',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      notifications.show({
        color: 'red',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" shadow="sm">
      <Text mb="sm" fw={500}>
        Change your password
      </Text>
      <Stack>
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
        />
        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
        <Group justify="end" mt="sm">
          <Button loading={loading} onClick={handleSubmit} color="primary">
            Update password
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
