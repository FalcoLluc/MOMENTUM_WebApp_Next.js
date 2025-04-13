// components/auth/BusinessAuthForm/BusinessAuthForm.tsx
'use client';

import {
  Anchor,
  Button,
  Divider,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Select,
} from '@mantine/core';
import { GoogleButton } from '../providers/GoogleButton';
import classes from './BusinessAuthForm.module.css';
import Link from 'next/link';

interface BusinessAuthFormProps {
  type: 'login' | 'register';
}

export function BusinessAuthForm({ type }: BusinessAuthFormProps) {
  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked for business');
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          {type === 'login' ? 'Business Login' : 'Business Registration'}
        </Title>

        <GoogleButton onClick={handleGoogleSignIn} mb="xl" />

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <TextInput
          label="Business Email"
          placeholder="contact@yourbusiness.com"
          size="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
        />

        {type === 'register' && (
          <>
            <TextInput
              label="Business Name"
              placeholder="Your Business Inc."
              mt="md"
              size="md"
            />
            <Select
              label="Business Type"
              placeholder="Select type"
              data={['Retail', 'Service', 'Manufacturing', 'Other']}
              mt="md"
              size="md"
            />
          </>
        )}

        <Button fullWidth mt="xl" size="md">
          {type === 'login' ? 'Business Login' : 'Register Business'}
        </Button>

        <Text ta="center" mt="md">
          {type === 'login'
            ? "Don't have a business account?"
            : 'Already have a business account?'}{' '}
          <Anchor
            component={Link}
            href={{
              pathname: type === 'login' ? '/register' : '/login',
              query: { authType: 'business' },
            }}
            fw={700}
          >
            {type === 'login' ? 'Register Business' : 'Business Login'}
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
