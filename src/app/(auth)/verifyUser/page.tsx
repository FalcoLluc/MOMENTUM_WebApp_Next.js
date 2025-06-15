'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Button, Card, Center, Stack, Loader } from '@mantine/core';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { isAxiosError } from 'axios';

const VerifyUser: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accountVerified, setAccountVerified] = useState(false);
  const [error, setError] = useState("");

  const username = searchParams.get("u");
  const requestId = searchParams.get("requestId");

  useEffect(() => {
    if (!getRuntimeEnv().API_URL) return;
    if (!username || !requestId) return;
    
    authService.verifyUser(username, requestId)
      .then(() => {
        setAccountVerified(true);
      })
      .catch((e) => {
        if (isAxiosError(e) && e.status == 404) {
          setError("The activation code has already been used");
        } else if (isAxiosError(e)) {
          setError(e.message);
        } else {
          setError("Unexpected error occurred");
        }
      });
  }, [username, requestId]);


  if (accountVerified) {
    return (
      <Container size="xs" py="xl">
        <Card shadow="md" radius="md" padding="xl" withBorder>
          <Center mb="md">
            <IconCheck size={48} color="green" />
          </Center>
          <Stack align="center" gap="sm">
            <Title order={2}>Account Verified</Title>
            <Text size="md" c="dimmed">
              Welcome, {username}! Your account has been successfully verified.
            </Text>
            <Button onClick={() => router.push('/login')} mt="md">
              Go to Login
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  } else if (error) {
    return (
      <Container size="xs" py="xl">
        <Card shadow="md" radius="md" padding="xl" withBorder>
          <Center mb="md">
            <IconExclamationCircle size={48} color="red" />
          </Center>
          <Stack align="center" gap="sm">
            <Title order={2}>Error</Title>
            <Text size="md">
              There was an error verifying the user.
            </Text>
            <Text size ="sm">
              {error}
            </Text>
          </Stack>
        </Card>
      </Container>
    )
  } else {
    return (
      <Container size="xs" py="xl">
        <Card shadow="md" radius="md" padding="xl" withBorder>
          <Center mb="md">
            <Loader color="blue" size="lg" />
          </Center>
        </Card>
      </Container>
    )
  }

};

export default VerifyUser;