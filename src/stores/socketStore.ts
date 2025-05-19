'use client';

import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { getRuntimeEnv } from "@/utils/getRuntimeEnv";

const { NEXT_PUBLIC_API_URL } = getRuntimeEnv();

interface SocketStore {
    socket: Socket | null;
    setSocket: (socket: Socket | null) => void;
}

export const useSocket = create<SocketStore>((set) => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
}));

export function updateSocket(accessToken: string | null) {
    const socket = useSocket.getState().socket;
    if (socket) {
        console.info("disconnecting socket");
        socket.disconnect();
        useSocket.getState().setSocket(null);
    }

    if (!accessToken) return;
    
    console.info("connecting socket");
    const newSocket = io(NEXT_PUBLIC_API_URL, {
        auth: {
            token: accessToken,
        },
        transports: ["polling", "websocket"],
    }); 
    useSocket.getState().setSocket(newSocket);
}

useAuthStore.subscribe(
    (state, prevState) => {
        if (state.accessToken == prevState.accessToken) return;
        updateSocket(state.accessToken);
    },
);

