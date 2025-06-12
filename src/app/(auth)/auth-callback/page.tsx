'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Store the token in Zustand
      const mockUser: User = {
        _id: 'mock-user-id',
        name: 'Mock User',
        age: 25,
        mail: 'mockuser@example.com',
        password: 'mockpassword', // This can be hashed if needed
      };
      login(mockUser, token);
      router.replace('/users/account'); // Redirect to the user's account page
    } else {
      console.error('No token found in the callback URL');
      router.replace('/login?error=missing_token'); // Redirect to login with an error
    }
  }, [login, router]);

  return <div>Processing login...</div>;
}