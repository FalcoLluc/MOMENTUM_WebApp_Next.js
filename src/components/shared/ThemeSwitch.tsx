import { Switch, Group, Text, Box } from '@mantine/core';
import { useThemeStore } from '@/stores/themeStore';

export function ThemeSwitch() {
  const { isDaltonic, toggleTheme } = useThemeStore();

  return (
    <Box
      p="sm"
      style={{
        border: '1px solid #dee2e6',
        borderRadius: 8,
        backgroundColor: 'var(--mantine-color-body)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <Group align="center" gap="md">
        <Text size="sm" fw={500} color="primary">
          Daltonic Mode
        </Text>
        <Switch
          color="primary"
          checked={isDaltonic}
          onChange={toggleTheme}
          size="md"
          styles={{
            track: {
              backgroundColor: isDaltonic ? 'var(--mantine-color-primary-6)' : undefined,
            },
          }}
        />
      </Group>
    </Box>
  );
}