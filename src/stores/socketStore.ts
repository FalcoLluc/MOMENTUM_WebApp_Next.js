'use client';

import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { getRuntimeEnv } from "@/utils/getRuntimeEnv";
import { SocketMessage } from "@/types";
import { notifications } from "@mantine/notifications";
import { refreshAccessToken } from "@/lib/apiClient";

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
    console.info(accessToken);
    const { API_URL } = getRuntimeEnv();
    const newSocket = io(API_URL, {
        auth: {
            token: accessToken,
        },
        transports: ["polling", "websocket"],
        autoConnect: true,
    }); 
    useSocket.getState().setSocket(newSocket);

    // subscribe to notifications globally
    newSocket.on("new_message", (message: SocketMessage) => {
        notifications.show({
            title: "New Message",
            message: `${message.senderName}: ${message.message}`,
            autoClose: 5000,
        })
    })

    newSocket.on("status", async (message) => {
        switch (message.status) {
            case "unauthorized":
                await refreshAccessToken();
                // TODO podriem re-enviar el missatge per assegurar-nos que arriba
                // al destinatari. Amb l'arquitectura actual, és molt complicat.
                break;
        }
    })
}

useAuthStore.subscribe(
    (state, prevState) => {
        if (state.accessToken != prevState.accessToken) {
            updateSocket(state.accessToken);
        }
    }
);

