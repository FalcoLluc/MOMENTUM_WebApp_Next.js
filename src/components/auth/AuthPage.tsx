// components/auth/AuthPage.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthTypeSelector } from './AuthTypeSelector';
import { AuthForm } from './AuthForm/AuthForm';
import { BusinessAuthForm } from './BusinessAuthForm/BusinessAuthForm';
import classes from './AuthPage.module.css';
import { useAuthStore } from '@/stores/authStore';
import { WorkerRole } from '@/types';
import { authService } from '@/services/authService';

export function AuthPage({ type }: { type: 'login' | 'register' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authType = (searchParams.get('authType') as 'user' | 'business') || 'user';
  const { accessToken, user, worker } = useAuthStore();

  const setAuthType = (newType: 'user' | 'business') => {
    const params = new URLSearchParams(searchParams);
    params.set('authType', newType);
    router.replace(`?${params.toString()}`);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!accessToken) {
          return;
        }
        const isValid = await authService.validateToken();
        if (!isValid) {
          return;
        }

        console.log('Token is valid');

        // If token is valid, redirect based on user type
        if (user) {
          router.replace('/users/account'); // Redirect regular user
        } else if (worker) {
          if (worker.role === WorkerRole.ADMIN) {
            router.replace('/admins/account'); // Redirect admin worker
          } else {
            router.replace('/workers/account'); // Redirect normal worker
          }
        } else {
          console.error('Valid token but no user/worker data');
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.selectorContainer}>
        <div className={classes.selectorInner}>
          <AuthTypeSelector value={authType} onChange={setAuthType} />
        </div>
      </div>

      <div className={classes.formsContainer}>
        {authType === 'user' ? (
          <AuthForm type={type} />
        ) : (
          <BusinessAuthForm type={type} />
        )}
      </div>
    </div>
  );
}
