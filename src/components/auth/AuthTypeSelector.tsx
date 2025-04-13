// components/auth/AuthTypeSelector.tsx
'use client';

import { SegmentedControl, Box, Center } from '@mantine/core';
import { IconUser, IconBuildingStore } from '@tabler/icons-react';

type AuthType = 'user' | 'business';

export function AuthTypeSelector({
  value,
  onChange,
}: {
  value: AuthType;
  onChange: (value: AuthType) => void;
}) {
  const handleChange = (value: string) => {
    if (value === 'user' || value === 'business') {
      onChange(value);
    }
  };

  return (
    <SegmentedControl
      value={value}
      onChange={handleChange}
      data={[
        {
          value: 'user',
          label: (
            <Center>
              <IconUser size="1rem" />
              <Box ml={10}>User</Box>
            </Center>
          ),
        },
        {
          value: 'business',
          label: (
            <Center>
              <IconBuildingStore size="1rem" />
              <Box ml={10}>Business</Box>
            </Center>
          ),
        },
      ]}
    />
  );
}
