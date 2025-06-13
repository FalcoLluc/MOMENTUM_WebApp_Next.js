'use client';

import {
  NavLink,
  Stack,
  Text,
  Avatar,
  Group,
  UnstyledButton,
} from '@mantine/core';
import {
  IconCalendar,
  IconMessage,
  IconUser,
  IconLogout,
  IconMap,
  IconSettings,
  IconBuildingStore,
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import classes from './UsersNavbar.module.css';
import { authService } from '@/services/authService';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/stores/authStore';
import { ThemeSwitch } from '@/components/shared/ThemeSwitch';

const navLinks = [
  { label: 'Calendar', icon: IconCalendar, href: '/users/calendar' },
  { label: 'Chats', icon: IconMessage, href: '/users/chats' },
  { label: 'Map', icon: IconMap, href: '/users/appointments' },
  { label: 'Locations', icon: IconBuildingStore, href: '/users/locations' },
  { label: 'Account', icon: IconUser, href: '/users/account' },
  { label: 'Settings', icon: IconSettings, href: '/users/settings' },
];

export function UsersNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    // Add your logout logic here
    console.log('Logging out...');
    await authService.logoutUser();
    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out',
      color: 'green',
    });
    router.push('/login?authType=user');
  };

  return (
<Stack h="100%" justify="space-between" gap={0}>
  <Stack gap={0}>
    <Group p="md" className={classes.header}>
      <Text fw={700} size="xl" color="primary"> {/* Use primary for the header */}
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
    <ThemeSwitch />
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src={null}
          radius="xl"
          color="secondary"
        >
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user?.name || 'User'}
          </Text>
          <Text c="dimmed" size="xs"> {/* Use secondary for the email */}
            {user?.mail || 'user@example.com'}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  </Stack>
</Stack>
  );
}