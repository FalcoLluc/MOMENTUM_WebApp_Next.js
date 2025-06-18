// components/auth/AuthForm/AuthForm.tsx
'use client';

import {
  Anchor,
  Button,
  Divider,
  Paper,
  PasswordInput,
  NumberInput,
  Text,
  TextInput,
  Title,
  LoadingOverlay,
} from '@mantine/core';
import classes from './AuthForm.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { authService } from '@/services/authService';
import { LoginRequestBody } from '@/types';
import { User } from '@/types';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';
import { IconBrandGoogle } from '@tabler/icons-react';


interface AuthFormProps {
  type: 'login' | 'register';
}

const INITIAL_LOGIN_STATE: LoginRequestBody = {
  name_or_mail: '',
  password: '',
};

const INITIAL_REGISTER_STATE: User = {
  name: '',
  age: 18,
  mail: '',
  password: '',
};

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState<LoginRequestBody>(INITIAL_LOGIN_STATE);
  const [registerCredentials, setRegisterCredentials] = useState<User>(INITIAL_REGISTER_STATE);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    specialChar: false,
  });

  const handleGoogleSignIn = () => {
    // FALTA POSAR LOGICA
    console.log('Google sign in clicked');
    const GOOGLE_AUTH_URL = `${getRuntimeEnv().API_URL}/auth/google`; // Backend Google OAuth endpoint
    window.location.href = GOOGLE_AUTH_URL; // Redirect to backend
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterInputChange = (name: keyof User, value: string | number) => {
    setRegisterCredentials(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password: string) => {
    setPasswordValidations({
      length: password.length >= 8,
      uppercase: (password.match(/[A-Z]/g) || []).length >= 2,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  useEffect(() => {
    validatePassword(registerCredentials.password);
  }, [registerCredentials.password]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const { user } = await authService.loginUser(loginCredentials);
      notifications.show({
        title: 'Login successful',
        message: `Welcome back, ${user.name}!`,
        color: 'green',
      });
      router.push('/users/account');
    } catch (error: unknown) {
      // This will now properly show server error messages
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      notifications.show({
        title: 'Login error',
        message: errorMessage,
        color: 'red',
      });
    }finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { length, uppercase, specialChar } = passwordValidations;

    if (!length || !uppercase || !specialChar) {
      notifications.show({
        title: 'Invalid Password',
        message: 'Password does not meet all requirements.',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    if (registerCredentials.password !== confirmPassword) {
      notifications.show({
        title: 'Password mismatch',
        message: 'Passwords do not match.',
        color: 'red',
      });
      setLoading(false);
      return;
    }
  
    try {
      const { success, message } = await authService.registerUser(registerCredentials);
  
      if (success) {
        notifications.show({
          title: 'Registration successful',
          message: message,
          color: 'green',
        });
        router.push('/login?authType=user');
      }
    } catch (error: unknown) {
      // Extract and display the error message
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      notifications.show({
        title: 'Registration error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (type === 'register') {
    return (
      <div className={classes.wrapper} style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Paper className={classes.form} radius={0} p={30} component="form" onSubmit={handleRegisterSubmit}>
          <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
            Create an account
          </Title>

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            color="primary"
            fullWidth
            mt="md"
            leftSection={<IconBrandGoogle size="1rem" />}
          >
            Sign in with Google
          </Button>

          <Divider label="Or register with email" labelPosition="center" my="lg" />

          <TextInput
            label="Full Name"
            name="name"
            placeholder="Your name"
            value={registerCredentials.name}
            onChange={(e) => handleRegisterInputChange('name', e.target.value)}
            size="md"
            required
            color="primary"
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

          <TextInput
            label="Email"
            name="mail"
            type="email"
            placeholder="your@email.com"
            value={registerCredentials.mail}
            onChange={(e) => handleRegisterInputChange('mail', e.target.value)}
            mt="md"
            size="md"
            required
            color="primary"
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Your password"
            value={registerCredentials.password}
            onChange={(e) => handleRegisterInputChange('password', e.target.value)}
            mt="md"
            size="md"
            required
            color="primary"
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Retype your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            mt="md"
            size="md"
            required
            color="primary"
          />

          <div style={{ fontSize: '0.875rem', marginTop: '10px', color: 'gray' }}>
            <Text fw={500}>Password must contain:</Text>
            <Text c={passwordValidations.length ? 'green' : 'red'}>
              {passwordValidations.length ? '✅' : '❌'} At least 8 characters
            </Text>
            <Text c={passwordValidations.uppercase ? 'green' : 'red'}>
              {passwordValidations.uppercase ? '✅' : '❌'} Two uppercase letters
            </Text>
            <Text c={passwordValidations.specialChar ? 'green' : 'red'}>
              {passwordValidations.specialChar ? '✅' : '❌'} One special character
            </Text>
          </div>

          <Button type="submit" fullWidth mt="xl" size="md" loading={loading} color="primary">
            Register
          </Button>

          <Text ta="center" mt="md">
            Already have an account?{' '}
            <Anchor
              component={Link}
              href={{
                pathname: '/login',
                query: { authType: 'user' },
              }}
              fw={700}
            >
              Login
            </Anchor>
          </Text>
        </Paper>
      </div>
    );
  }

  return (
    <div className={classes.wrapper} style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Paper className={classes.form} radius={0} p={30} component="form" onSubmit={handleLoginSubmit}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome back!
        </Title>
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          color="primary"
          fullWidth
          mt="md"
          leftSection={<IconBrandGoogle size="1rem" />}
        >
          Sign in with Google
        </Button>
        <Divider label="Or continue with username/email" labelPosition="center" my="lg" />

        <TextInput
          label="Username or Email"
          name="name_or_mail"
          placeholder="Enter your username or email"
          value={loginCredentials.name_or_mail}
          onChange={handleLoginInputChange}
          size="md"
          required
          color="primary"
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Your password"
          value={loginCredentials.password}
          onChange={handleLoginInputChange}
          mt="md"
          size="md"
          required
          color="primary"
        />

        <Button type="submit" fullWidth mt="xl" size="md" loading={loading} color="primary">
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Anchor
            component={Link}
            href={{
              pathname: '/register',
              query: { authType: 'user' },
            }}
            fw={700}
          >
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}