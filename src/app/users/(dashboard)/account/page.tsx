// app/users/dashboard/page.tsx
'use client';

import { useAuthStore } from "@/stores/authStore";

export default function UserAccountPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>User Account</h1>
      <p>Welcome, <strong>{user.name}</strong>!</p>
      <p>Email: {user.mail}</p>
      <p>Age: {user.age}</p>
      {/* Add more user-specific content here */}
    </div>
  );
}