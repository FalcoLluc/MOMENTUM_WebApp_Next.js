// app/users/dashboard/page.tsx
'use client';

import { useAuthStore } from "@/stores/authStore";

export default function UserDashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, <strong>{user.name}</strong>!</p>
      <p>Email: {user.mail}</p>
      <p>Age: {user.age}</p>
      {/* Add more user-specific content here */}
    </div>
  );
}
