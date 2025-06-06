'use client';

import { ChatList, MessageWindow } from "@/components";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { ChatListItem } from "@/types";
import { Box, Divider, Group, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ChatContent() {
    const [chats, setChats] = useState<ChatListItem[] | null>(null);
    const [chat, setChat] = useState<ChatListItem | null>(null);
    const user = useAuthStore((state) => state.user);
    const params = useSearchParams();
    const chatId = params.get("u");

    useEffect(() => {
        if (!chatId || !chats) {
            setChat(null);
        } else {
            for (const c of chats) {
                if (chatId == c[1]) setChat(c);
            }
        }
    }, [chatId, chats]);

    useEffect(() => {
        if (!user) return;
        chatService.getUserChats(user._id!)
            .then((response) => {
                setChats(response.data.people);
                console.debug(response.data);
            })
            .catch((error: AxiosError) => {
                if (error.response && (error.response.data as { error: string }).error == "No people found") {
                    setChats([]);
                    return;
                }
                notifications.show({
                    message: "Error fetching chats",
                    color: "red",
                });
            });
    }, [user]);

    if (!user) return null;

    return (
        <Group
            style={{
                height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
            }}
        >
            <Box style={{ flex: "0 1 200px", height: "100%" }}>
                <ChatList chats={chats}></ChatList>
            </Box>
            <Divider orientation="vertical"></Divider>
            <Box style={{ flex: "1 0 auto", height: "100%" }}>
                {chat ? <MessageWindow chat={chat} user={user}></MessageWindow> : null}
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