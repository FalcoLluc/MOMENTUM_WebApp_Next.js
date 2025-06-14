'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import axios from 'axios';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';

const { API_URL } = getRuntimeEnv();

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const fetchUserById = async (userId: string, token: string) => {
      try {
        const response = await axios.get<User>(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the access token in the Authorization header
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
      }
    };

    const processLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('token');
      const userId = urlParams.get('userId');

      if (accessToken && userId) {
        try {
          // Fetch the user by ID
          const user = await fetchUserById(userId, accessToken);

          // Store the user and token in Zustand
          login(user, accessToken);

          // Redirect to the user's account page
          router.replace('/users/account');
        } catch (error) {
          console.error('Failed to process login:', error);
          router.replace('/login?error=fetch_user_failed'); // Redirect to login with an error
        }
      } else {
        console.error('No token or userId found in the callback URL');
        router.replace('/login?error=missing_token'); // Redirect to login with an error
      }
    };

    processLogin();
  }, [login, router]);

  return <div>Processing login...</div>;
}