// app/page.tsx
'use client';

import { Title, Text, Button, Group } from '@mantine/core';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  // Optional: Redirect to user login automatically
  useEffect(() => {
    // Uncomment this if you want automatic redirection
    // router.push('/login?authType=user');
  }, [router]);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Title order={1} mb="md">
        Welcome to Mantine!
      </Title>

      <Text mb="xl">
        This is the simplest possible starter.
      </Text>

      <Group>
        <Button
          component={Link}
          href={{
            pathname: '/login',
            query: { authType: 'user' }
          }}
          size="lg"
          variant="outline"
        >
          User Login
        </Button>

        <Button
          component={Link}
          href={{
            pathname: '/login',
            query: { authType: 'business' }
          }}
          size="lg"
          variant="outline"
        >
          Business Login
        </Button>
      </Group>
    </div>
  );
}