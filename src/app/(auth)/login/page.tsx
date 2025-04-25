// app/login/page.tsx
import { AuthPage } from '@/components';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage type="login" />
    </Suspense>
  );
}