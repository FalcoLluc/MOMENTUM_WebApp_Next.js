'use client';

import { useEffect, useState } from 'react';
import { updateSocket } from '@/stores/socketStore';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';

export default function ClientSocketProvider() {

  const [ready, setReady] = useState(false);

  // ensure the socket.io is loaded when we have the correct api url
  useEffect(() => {
    // Poll or wait for RUNTIME_CONFIG to be present
    const waitForRuntimeConfig = () => {
      if (getRuntimeEnv().API_URL != '') {
        setReady(true); // Now it's safe to initialize socket
      } else {
        requestAnimationFrame(waitForRuntimeConfig); // Retry in next frame
      }
    };

    waitForRuntimeConfig();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      updateSocket(accessToken);
    }
  }, [ready]);

  return null;
}