'use client'
import { useAuthStore } from "@/stores/authStore"
import { ChatListItem } from "@/types"
import { ChatUserType } from "@/types/enums";
import { Button, NavLink, Skeleton, Stack, Title } from "@mantine/core"

interface ChatListParams {
    chats: ChatListItem[] | null,
    viewChat: (chat: ChatListItem) => void,
}

export function WorkerChatList({chats, viewChat}: ChatListParams) {
    const worker = useAuthStore(s => s.worker);
    if (!worker) return null;

    const workerChats = chats?.filter(c => c[2] == ChatUserType.WORKER);
    const locationChats = chats?.filter(c => c[2] == ChatUserType.LOCATION);

    return (
        <Stack>
            <Button variant="filled" color="teal">New Chat</Button>
            <Title order={4}>Your Chats</Title>
            { workerChats ? 
                workerChats.map((chat: ChatListItem) => (
                    <NavLink
                        key={chat[1]}
                        label={chat[0]}
                        onClick={() => viewChat(chat)}
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
                        onClick={() => viewChat(chat)}
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