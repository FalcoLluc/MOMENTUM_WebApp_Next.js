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
} from '@mantine/core';
import { GoogleButton } from '../providers/GoogleButton';
import classes from './BusinessAuthForm.module.css';
import Link from 'next/link';
import { useState } from 'react';

export interface NewBusinessRequestBody {
  name: string;
  age: number;
  mail: string;
  password: string;
  businessName: string;
}

export interface LoginRequestBody {
  name_or_mail: string;
  password: string;
}

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
  const [registerCredentials, setRegisterCredentials] = useState<NewBusinessRequestBody>(INITIAL_REGISTER_STATE);
  const [loginCredentials, setLoginCredentials] = useState<LoginRequestBody>(INITIAL_LOGIN_STATE);

  const handleRegisterInputChange = (field: keyof NewBusinessRequestBody, value: string | number) => {
    setRegisterCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoginInputChange = (field: keyof LoginRequestBody, value: string) => {
    setLoginCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'register') {
      // Call your register API with registerCredentials
      console.log('Register:', registerCredentials);
    } else {
      // Call your login API with loginCredentials
      console.log('Login:', loginCredentials);
    }
  };

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

          <Button fullWidth mt="xl" size="md" type="submit">
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