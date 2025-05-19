'use client';

import { useEffect } from 'react';
import { updateSocket } from '@/stores/socketStore';

export default function ClientSocketProvider() {
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      console.debug("accessToken: " + accessToken);
      updateSocket(accessToken);
    }
  }, []);

  return null;
}