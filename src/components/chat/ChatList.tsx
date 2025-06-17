'use client'
import { ChatListItem } from "@/types"
import { NavLink, Skeleton, Stack } from "@mantine/core"

interface ChatListParams {
    chats: ChatListItem[] | null,
    viewChat: (chat: ChatListItem) => void,
}

export function ChatList({chats, viewChat}: ChatListParams) {

    return (
        <Stack>
            { chats ? 
                chats.map((chat: ChatListItem) => (
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