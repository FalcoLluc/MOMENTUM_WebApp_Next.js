'use client'

import { ChatList, MessageWindow } from "@/components"
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { ChatListItem } from "@/types";
import { Box, Divider, Group } from "@mantine/core"
import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";


export default function ChatPage() {
    const [chats, setChats] = useState<ChatListItem[] | null>(null);
    const [chat, setChat] = useState<ChatListItem | null>(null);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (!user) return;
        chatService.getUserChats(user._id!)
            .then((response) => {setChats(response.data.people); console.debug(response.data)}) 
            .catch((error: AxiosError) => {
                if (error.response && (error.response.data as {error: string}).error == "No people found") {
                    setChats([]);
                    return;
                }
                notifications.show({
                    message: "Error fetching chats",
                    color: "red",
                })
            });
    }, [user])
    
    function onChatSelected(chat: ChatListItem) {
        setChat(chat);
    }


    if (!user) return null;

    //const isMobile = useMediaQuery(`(max-width: ${em(750)})`)

    return (
        <Group style={{
            height: "calc(100dvh - var(--app-shell-header-offset, 0rem) - var(--app-shell-padding) - var(--app-shell-footer-offset, 0rem) - var(--app-shell-padding))",
        }}>
            <Box style={{flex: "0 1 200px", height: "100%"}}>
                <ChatList chats={chats} onChatSelected={onChatSelected}></ChatList>
            </Box>
            <Divider orientation="vertical"></Divider>
            <Box style={{flex: "1 0 auto", height: "100%"}}>
                { chat ? 
                    <MessageWindow chat={chat} user={user}></MessageWindow>
                    : null
                }
            </Box>
        </Group>
    )
}