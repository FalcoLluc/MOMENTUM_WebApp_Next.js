// app/register/page.tsx
import { AuthPage } from '@/components/auth/AuthPage';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthPage type="register" />
    </Suspense>
  );
}