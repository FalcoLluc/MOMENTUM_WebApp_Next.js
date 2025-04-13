// components/auth/AuthPage.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthTypeSelector } from './AuthTypeSelector';
import { AuthForm } from './AuthForm/AuthForm';
import { BusinessAuthForm } from './BusinessAuthForm/BusinessAuthForm';
import classes from './AuthPage.module.css';

export function AuthPage({ type }: { type: 'login' | 'register' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authType = (searchParams.get('authType') as 'user' | 'business') || 'user';

  const setAuthType = (newType: 'user' | 'business') => {
    const params = new URLSearchParams(searchParams);
    params.set('authType', newType);
    router.replace(`?${params.toString()}`);
  };

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
