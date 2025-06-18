'use client';

import { UsersNavbar } from '@/components';
import { AppShell, Burger, Group, ActionIcon, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2, IconX } from '@tabler/icons-react';

export default function DashboardUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      style={{
        // This ensures notifications appear above AppShell content
        position: 'relative',
        zIndex: 1,
      }}
    >
      <AppShell.Header p="md" style={{ zIndex: 200 }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle mobile navigation"
            />
            <ActionIcon
              onClick={toggleDesktop}
              size="lg"
              variant="light"
              visibleFrom="sm"
              aria-label="Toggle desktop navigation"
              color="primary" 
            >
              {desktopOpened ? <IconX size="1.5rem" /> : <IconMenu2 size="1.5rem" />}
            </ActionIcon>
            <Image
              src="/images/logo-no-background.png"
              alt="Logo"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '48px',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
             />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ zIndex: 150 }}>
        <UsersNavbar />
      </AppShell.Navbar>

      <AppShell.Main style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}