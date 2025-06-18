'use client';

import { MessageWindow, WorkerChatList } from "@/components";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { ChatListItem } from "@/types";
import { Box, Divider, Group, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AxiosError, isAxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";

function ChatContent() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatListItem[] | null>(null);
    const [chat, setChat] = useState<ChatListItem | null>(null);
    const worker = useAuthStore((state) => state.worker);
    const params = useSearchParams();
    const chatId = params.get("u");

    useEffect(() => {
        if (!chatId || !chats) {
            setChat(null);
            return;
        } 

        for (const c of chats) {
            if (chatId == c[1]) setChat(c);
            return;
        }

    }, [chatId, chats]);

    const fetchChats = useCallback(async () => {
        if (!worker) return;
        try {
            const workerChats = (await chatService.getWorkerChats(worker._id!)).data.people;
            setChats(workerChats);
        } catch (e) {
            if (isAxiosError(e)) {
                const error = e as AxiosError;
                if (error.response && (error.response.data as { error: string }).error == "No people found") {
                    setChats([]);
                    return;
                }
            }

            notifications.show({
                message: "Error fetching chats",
                color: "red",
            }); 
            setChats([]);
        }
    }, [worker]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (!chat) return;
        window.history.replaceState({}, "", "/workers/chats?u=" + chat[1]);
    }, [chat]);

    useEffect(() => {
        if (!worker) {
            router.push("/login");
        }
    }, [worker, router]);

    if (!worker) return null;
    return (
        <Group
            style={{
                height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
            }}
        >
            <Box style={{ flex: "0 1 200px", height: "100%" }}>
                <WorkerChatList chats={chats} viewChat={setChat}></WorkerChatList>
            </Box>
            <Divider orientation="vertical"></Divider>
            <Box style={{ flex: "1 0 auto", height: "100%" }}>
                {chat ? <MessageWindow chat={chat} user={worker} updateMessageList={fetchChats}></MessageWindow> : null}
            </Box>
        </Group>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<Loader />}>
            <ChatContent />
        </Suspense>
    );
}