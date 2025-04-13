// components/auth/providers/GoogleButton.tsx
'use client';

import { Button, ButtonProps } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';

interface GoogleButtonProps extends ButtonProps {
  onClick?: () => void;
}

export function GoogleButton({ onClick, ...props }: GoogleButtonProps) {
  const handleClick = () => {
    onClick?.();
    signIn('google');
  };

  return (
    <Button
      leftSection={<IconBrandGoogle size="1rem" />}
      variant="default"
      fullWidth
      onClick={handleClick}
      {...props}
    >
      Continue with Google
    </Button>
  );
}