'use client';

import { useAuthStore } from "@/stores/authStore";

export default function WorkersPage() {
  const worker = useAuthStore((state) => state.worker);

  if (!worker) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h1>Workers of Business</h1>
    </div>
  );
}