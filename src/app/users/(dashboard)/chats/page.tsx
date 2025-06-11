'use client';

import { ChatList, MessageWindow } from "@/components";
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
    const user = useAuthStore((state) => state.user);
    const params = useSearchParams();
    const chatId = params.get("u");

    useEffect(() => {
        if (!chatId || !chats) {
            console.debug("setting chat to null")
        } else {
            for (const c of chats) {
                if (chatId == c[1]) {
                    setChat(c);
                }
            }
        }
    }, [chatId, chats]);

    const fetchChats = useCallback(async () => {
        if (!user) return;
        try {
            const userChats = (await chatService.getUserChats(user._id!)).data.people;
            setChats(userChats);
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
    }, [user]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (!chat) return;
        window.history.replaceState({}, "", "/users/chats?u=" + chat[1]);
    }, [chat]);

    useEffect(() => {
        if (!user) {
            router.push("/login");
        }
    }, [user, router]);

    if (!user) return null;
    return (
        <Group
            style={{
                height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
            }}
        >
            <Box style={{ flex: "0 1 200px", height: "100%" }}>
                <ChatList chats={chats} viewChat={setChat}></ChatList>
            </Box>
            <Divider orientation="vertical"></Divider>
            <Box style={{ flex: "1 0 auto", height: "100%" }}>
                {chat ? <MessageWindow chat={chat} user={user} updateMessageList={fetchChats}></MessageWindow> : null}
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