'use client'
import { useAuthStore } from "@/stores/authStore"
import { ChatListItem } from "@/types"
import { Button, NavLink, Skeleton, Stack, Title } from "@mantine/core"

interface ChatListParams {
    chats: ChatListItem[] | null,
}

export function WorkerChatList({chats}: ChatListParams) {
    const worker = useAuthStore(s => s.worker);
    if (!worker) return null;

    const workerChats = chats?.filter(c => c[3] == worker._id);
    const locationChats = chats?.filter(c => c[3] != worker._id);

    return (
        <Stack>
            <Button variant="filled" color="teal">New Chat</Button>
            <Title order={4}>Your Chats</Title>
            { workerChats ? 
                workerChats.map((chat: ChatListItem) => (
                    <NavLink
                        key={chat[1]}
                        label={chat[0]}
                        href={"/workers/chats?u=" + chat[1]}
                    />
                ))
            :
                Array(4).fill(true).map((_, i) => (
                    <Skeleton
                        height={20}
                        width="100% - 8px"
                        mx={4}
                        my={8}
                        radius="xl"
                        key={i}
                    ></Skeleton>
                ))
            }
            <Title order={4}>Location Chats</Title>
            { locationChats ? 
                locationChats.map((chat: ChatListItem) => (
                    <NavLink
                        key={chat[1]}
                        label={chat[0]}
                        href={"/workers/chats?u=" + chat[1]}
                    />
                ))
            :
                Array(4).fill(true).map((_, i) => (
                    <Skeleton
                        height={20}
                        width="100% - 8px"
                        mx={4}
                        my={8}
                        radius="xl"
                        key={i}
                    ></Skeleton>
                ))
            }
        </Stack>
    )
}