'use client'

import { chatService } from "@/services/chatService";
import { IMessage, User } from "@/types";
import { ActionIcon, Box, Paper, Stack, Text, TextInput, useMantineTheme } from "@mantine/core"
import { notifications } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react"
import { useEffect, useState } from "react";

export function MessageWindow ({chat, user}: {chat: [name: string, id: string], user: User}) {
    const theme = useMantineTheme();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [key, setKey] = useState<number>(0);   // change this to force chat reload

    useEffect(() => {
        async function getMessages() {
            try {
                const res = await chatService.getChat(chat[1], user._id!);
                const id = res.data._id!;
                const messages = await chatService.getLastMessages(id);
                setMessages(messages.data);
                setChatId(id);
            } catch {
                return;
            }
        }

        getMessages();
        return () => {
            setMessages([]);
        }
    }, [chat, user, key])


    async function sendMessage() {
        if (!chatId) return;
        try {
            await chatService.sendMessage(chatId, user.name, message);
            setKey(key + 1);
        } catch {
            notifications.show({
                color: "red",
                message: "Internal error sending message",
            })
        }
        
    }
    return (
        <Stack style={{height: "100%"}}>
            <Paper style={{backgroundColor: theme.colors.blue[7], display: "flex"}}>
                <Text 
                    size="lg"
                    fw="500"
                    c="white"
                    style={{margin: 4, flexGrow: 1, textAlign: "center"}}
                >{chat[0]}</Text>
            </Paper>

            <Box style={{flexGrow: 1}}>
                {
                    messages.map((message, i) => (
                        <p key={i}>{message.text}</p>
                    ))
                }
            </Box>

            <TextInput
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
                placeholder="message"
                rightSection={
                    <ActionIcon variant="filled" aria-label="" onClick={() => sendMessage()}><IconSend></IconSend></ActionIcon>
                }
            />
        </Stack>
    )
}