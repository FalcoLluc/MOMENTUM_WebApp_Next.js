'use client';

import { useEffect, useState } from 'react';
import { updateSocket, useSocket } from '@/stores/socketStore';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';
import { useAuthStore } from '@/stores/authStore';
import { JoinRoomRequest } from '@/types';

export default function ClientSocketProvider() {
  const [ready, setReady] = useState(false);
  const socket = useSocket((state) => state.socket);
  const user = useAuthStore((state) => state.user);
  const worker = useAuthStore((state) => state.worker);

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

  useEffect(() => {
    if (!socket) return;
    // login user or worker accordingly
    if (user) {
      console.debug("loggin in to socket with username " + user.name);
      socket.emit("user_login", user._id);
    } else if (worker) {
      console.debug("loggin in to socket with username " + worker.name);
      socket.emit("user_login", worker._id);
      // workers must also join rooms related to their locations:
      socket.emit("join_rooms", {
        userId: worker._id,
        rooms: worker.location.map(l => `location/${l}`),
      } as JoinRoomRequest);
    }

  }, [socket, user, worker]);

  return null;
}