import { Button, TextInput, Title, Text, Paper } from '@mantine/core';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: '100%', maxWidth: '400px' }}>
        <Title order={2} ta="center" mb={20}>
          Create account
        </Title>
        
        <TextInput 
          label="Name" 
          placeholder="Your name" 
          required 
          mb={15}
        />
        
        <TextInput 
          label="Email" 
          placeholder="your@email.com" 
          required 
          mb={15}
        />
        
        <TextInput 
          label="Password" 
          placeholder="Your password" 
          type="password" 
          required 
          mb={20}
        />
        
        <Button fullWidth type="submit">
          Create account
        </Button>
        
        <Text mt="md" ta="center">
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 500 }}>Login</Link>
        </Text>
      </Paper>
    </div>
  );
}