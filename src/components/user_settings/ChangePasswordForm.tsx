// components/user_settings/ChangePasswordForm.tsx
'use client';

import { useState, useEffect } from 'react';
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
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    specialChar: false,
  });

  const validatePassword = (password: string) => {
    setPasswordValidations({
      length: password.length >= 8,
      uppercase: (password.match(/[A-Z]/g) || []).length >= 2,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };
  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  const handleSubmit = async () => {
    const { length, uppercase, specialChar } = passwordValidations;

    if (!length || !uppercase || !specialChar) {
      notifications.show({
        title: 'Invalid Password',
        message: 'Password does not meet all requirements.',
        color: 'red',
      });
      setLoading(false);
      return;
    }

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
          label="Password"
          name="password"
          placeholder="Your password"
          value={newPassword}
          onChange={(e) =>  setNewPassword(e.currentTarget.value)}
          mt="md"
          size="md"
          required
          color="primary"
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Retype your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          mt="md"
          size="md"
          required
          color="primary"
        />

        <div style={{ fontSize: '0.875rem', marginTop: '10px', color: 'gray' }}>
          <Text fw={500}>Password must contain:</Text>
          <Text c={passwordValidations.length ? 'green' : 'red'}>
            {passwordValidations.length ? '✅' : '❌'} At least 8 characters
          </Text>
          <Text c={passwordValidations.uppercase ? 'green' : 'red'}>
            {passwordValidations.uppercase ? '✅' : '❌'} Two uppercase letters
          </Text>
          <Text c={passwordValidations.specialChar ? 'green' : 'red'}>
            {passwordValidations.specialChar ? '✅' : '❌'} One special character
          </Text>
        </div>
        <Group justify="end" mt="sm">
          <Button loading={loading} onClick={handleSubmit} color="primary">
            Update password
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
