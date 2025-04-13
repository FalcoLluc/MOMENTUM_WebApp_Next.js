// components/auth/AuthPage.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthTypeSelector } from './AuthTypeSelector';
import { AuthForm } from './AuthForm/AuthForm';
import { BusinessAuthForm } from './BusinessAuthForm/BusinessAuthForm';

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
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: '100%',
          maxWidth: '450px',
          padding: '0 20px',
        }}
      >
        <AuthTypeSelector value={authType} onChange={setAuthType} />
      </div>

      {authType === 'user' ? (
        <AuthForm type={type} />
      ) : (
        <BusinessAuthForm type={type} />
      )}
    </div>
  );
}
