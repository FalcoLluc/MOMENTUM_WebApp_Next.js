import { Title, Text, Button, Group } from '@mantine/core';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Title order={1} mb="md">
        Welcome to Mantine!
      </Title>
      <Text mb="xl">
        This is the simplest possible starter.
      </Text>
      
      <Group>
        <Button component={Link} href="/login" size="lg" variant="outline">
          Login
        </Button>
        <Button component={Link} href="/register" size="lg" variant="filled">
          Register
        </Button>
      </Group>
    </div>
  );
}