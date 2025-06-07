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
  NumberInput,
  LoadingOverlay,
} from '@mantine/core';
import { GoogleButton } from '../providers/GoogleButton';
import classes from './BusinessAuthForm.module.css';
import Link from 'next/link';
import { useState } from 'react';
import { workersService } from '@/services/workersService';
import { LoginRequestBody, NewBusinessRequestBody, WorkerRole } from '@/types';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/stores/authStore';

interface BusinessAuthFormProps {
  type: 'login' | 'register';
}

const INITIAL_REGISTER_STATE: NewBusinessRequestBody = {
  name: '',
  age: 18,
  mail: '',
  password: '',
  businessName: '',
};

const INITIAL_LOGIN_STATE: LoginRequestBody = {
  name_or_mail: '',
  password: '',
};

export function BusinessAuthForm({ type }: BusinessAuthFormProps) {
  const router = useRouter();
  const authStore = useAuthStore();
  const [loading, setLoading] = useState(false); // Add loading state
  const [registerCredentials, setRegisterCredentials] = useState<NewBusinessRequestBody>(INITIAL_REGISTER_STATE);
  const [loginCredentials, setLoginCredentials] = useState<LoginRequestBody>(INITIAL_LOGIN_STATE);

  const handleRegisterInputChange = (field: keyof NewBusinessRequestBody, value: string | number) => {
    setRegisterCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoginInputChange = (field: keyof LoginRequestBody, value: string) => {
    setLoginCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    if (type === 'register') {
      try {
        console.log('Register:', registerCredentials);
        const { success, message } = await workersService.registerBusiness(registerCredentials);

        if (success) {
          notifications.show({
            title: 'Registration successful',
            message: message,
            color: 'green',
          });
          router.push('/login?authType=business'); // Redirect after successful registration
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        notifications.show({
          title: 'Registration error',
          message: errorMessage,
          color: 'red',
        });
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      try {
        console.log('Login:', loginCredentials);
        const { worker } = await workersService.loginWorker(loginCredentials);
        authStore.setWorker(worker);

        notifications.show({
          title: 'Login successful',
          message: `Welcome back, ${worker.name}!`,
          color: 'green',
        });
        if (worker.role === WorkerRole.ADMIN) {
          router.push('/admins/account'); // Redirect to admin account page
        } else {
          router.push('/workers/account'); // Redirect to worker account page
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        notifications.show({
          title: 'Login error',
          message: errorMessage,
          color: 'red',
        });
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in clicked for business');
  };

  return (
    <div className={classes.wrapper} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} /> {/* Add LoadingOverlay */}
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          {type === 'login' ? 'Business Login' : 'Business Registration'}
        </Title>

        <GoogleButton onClick={handleGoogleSignIn} mb="xl" />

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form onSubmit={handleSubmit}>
          {type === 'login' ? (
            <>
              <TextInput
                label="Business Email or Name"
                placeholder="contact@yourbusiness.com or business name"
                size="md"
                value={loginCredentials.name_or_mail}
                onChange={(e) => handleLoginInputChange('name_or_mail', e.target.value)}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                mt="md"
                size="md"
                value={loginCredentials.password}
                onChange={(e) => handleLoginInputChange('password', e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <TextInput
                label="Business Name"
                placeholder="Your Business Inc."
                mt="md"
                size="md"
                value={registerCredentials.businessName}
                onChange={(e) => handleRegisterInputChange('businessName', e.target.value)}
                required
              />
              <TextInput
                label="Business Email"
                placeholder="contact@yourbusiness.com"
                size="md"
                value={registerCredentials.mail}
                onChange={(e) => handleRegisterInputChange('mail', e.target.value)}
                required
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                mt="md"
                size="md"
                value={registerCredentials.password}
                onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                required
              />
              <TextInput
                label="Admin Name"
                placeholder="Lluc Fernández"
                size="md"
                value={registerCredentials.name}
                onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                required
              />
              <NumberInput
                label="Age"
                name="age"
                min={18}
                max={120}
                value={registerCredentials.age}
                onChange={(value) => handleRegisterInputChange('age', Number(value))}
                mt="md"
                size="md"
                required
              />
            </>
          )}

          <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
            {type === 'login' ? 'Business Login' : 'Register Business'}
          </Button>
        </form>

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