'use client'
import { ChatListItem } from "@/types"
import { Button, NavLink, Skeleton, Stack } from "@mantine/core"

interface ChatListParams {
    chats: ChatListItem[] | null,
}

export function ChatList({chats}: ChatListParams) {

    return (
        <Stack>
            <Button variant="filled" color="teal">New Chat</Button>
            { chats ? 
                chats.map((chat: ChatListItem) => (
                    <NavLink
                        key={chat[1]}
                        label={chat[0]}
                        href={"/users/chats?u=" + chat[1]}
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