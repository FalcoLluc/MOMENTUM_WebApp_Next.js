'use client';

import {
  NavLink,
  Stack,
  Text,
  Avatar,
  Group,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import {
  IconUser,
  IconLogout,
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import classes from './AdminsNavbar.module.css';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/stores/authStore';
import { businessService } from '@/services/businessService';

const navLinks = [
  { label: 'Account', icon: IconUser, href: '/admins/account' },
];

export function AdminsNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useMantineTheme();
  const worker = useAuthStore((state) => state.worker);

  const handleLogout = async () => {
    // Add your logout logic here
    console.log('Logging out...');
    await businessService.logoutWorker();
    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out',
      color: 'green',
    });
    router.push('/login?authType=business');
  };

  return (
    <Stack h="100%" justify="space-between" gap={0}>
      <Stack gap={0}>
        <Group p="md" className={classes.header}>
          <Text fw={700} size="xl">
            Navigation
          </Text>
        </Group>

        <Stack p="md" gap="xs">
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              leftSection={<item.icon size="1rem" />}
              active={pathname === item.href}
              onClick={() => router.push(item.href)}
              variant="filled"
              className={classes.navLink}
            />
          ))}
        </Stack>
      </Stack>

      <Stack p="md" gap="xs">
        <NavLink
          label="Logout"
          leftSection={<IconLogout size="1rem" />}
          onClick={handleLogout}
          variant="filled"
          className={classes.navLink}
        />

        <UnstyledButton className={classes.user}>
            <Group>
              <Avatar
                src={null}
                radius="xl"
                color={theme.primaryColor}
              >
                {worker?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {worker?.name || 'Worker'}
                </Text>
                <Text c="dimmed" size="xs">
                  {worker?.mail || 'user@example.com'}
                </Text>
              </div>
            </Group>
          </UnstyledButton>
      </Stack>
    </Stack>
  );
}