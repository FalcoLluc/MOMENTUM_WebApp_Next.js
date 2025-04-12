'use client'; // Add this at the top since we're using client-side interactivity

import { Button, TextInput, Title, Text, Paper } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Logging in with:', { email, password });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit}>
          <Title order={2} ta="center" mb={20}>
            Welcome back!
          </Title>
          
          <TextInput 
            label="Email" 
            placeholder="your@email.com" 
            required 
            mb={15}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          
          <TextInput 
            label="Password" 
            placeholder="Your password" 
            type="password" 
            required 
            mb={20}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          
          <Button fullWidth type="submit">
            Sign in
          </Button>
          
          <Text mt="md" ta="center">
            Don't have an account?{' '}
            <Link href="/register" style={{ fontWeight: 500 }}>Register</Link>
          </Text>
        </form>
      </Paper>
    </div>
  );
}