'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useThemeStore } from '@/stores/themeStore';
import { defaultTheme, daltonicTheme } from '@/styles/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDaltonic = useThemeStore((state) => state.isDaltonic);
  return (
    <MantineProvider theme={isDaltonic ? daltonicTheme : defaultTheme}>
      <Notifications
        position="top-right"
        autoClose={3000}
        zIndex={1000}
        containerWidth="fit-content"
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 400, // or whatever fits your layout
        }}
      />
      {children}
    </MantineProvider>
  );
}