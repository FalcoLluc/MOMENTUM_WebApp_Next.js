'use client';

import { useAuthStore } from "@/stores/authStore";

export default function UserAccountPage() {
  const worker = useAuthStore((state) => state.worker);

  if (!worker) {
    return <div>Loading worker data...</div>;
  }

  return (
    <div>
      <h1>User Account</h1>
      <p>Welcome, <strong>{worker.name}</strong>!</p>
      <p>Email: {worker.mail}</p>
      <p>Age: {worker.age}</p>
      <p>Role: {worker.role}</p>
      {/* Add more user-specific content here */}
    </div>
  );
}