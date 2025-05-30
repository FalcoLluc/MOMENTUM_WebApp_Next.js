'use client'

import { chatService } from "@/services/chatService";
import { ChatListItem, IMessage, User } from "@/types";
import { ActionIcon, Paper, ScrollArea, Stack, Text, TextInput, useMantineTheme } from "@mantine/core"
import { notifications } from "@mantine/notifications";
import { IconSend } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageComponent } from "./MessageComponent";
import { useSocket } from "@/stores/socketStore";

interface SocketMessage {
    chatId: string,
    sender: string,
    message: string,
}

export function MessageWindow ({chat, user}: {chat: ChatListItem, user: User}) {
    const theme = useMantineTheme();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const socket = useSocket((state) => state.socket);
    
    const messageArea = useRef<HTMLDivElement>(null);
    function scrollToBottom() {
        if (!messageArea.current) return;
        messageArea.current.scrollTo({
            top: messageArea.current.scrollHeight,
            behavior: "instant",
        });
    }

    const newMessageCallback = useCallback((message: SocketMessage) => {
        console.log("got message: " + message);
        setMessages(m => [{
            from: message.sender,
            text: message.message,
            timestamp: new Date(),
        }, ...m]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    useEffect(() =>  {
        if (!socket) return;
        
        console.info("logging in to socket with username " + user.name);
        socket.on("new_message", newMessageCallback);
        socket.emit("user_login", user.name);

        return () => {
            if (socket) {
                socket.off("new_message", newMessageCallback);
            }
        }
    }, [socket, user, newMessageCallback]);

    useEffect(() => {
        async function getMessages() {
            try {
                const res = await chatService.getChat(chat[1], user._id!);
                const id = res.data._id!;
                const messages = await chatService.getLastMessages(id);
                setMessages(messages.data);
                setChatId(id);
                scrollToBottom();
            } catch {
                return;
            }
        }

        getMessages();
    }, [chat, user, newMessageCallback])


    async function sendMessage() {
        if (!chatId) return;
        if (message == "") return;
        try {
            await chatService.sendMessage(chatId, user.name, message);
            if (socket) {
                const newMessage = {
                    chatId: chatId,
                    sender: user.name,
                    message: message,
                } as SocketMessage;
                socket.emit("new_message", newMessage);
                console.info(newMessage);
                setMessage("");
                setMessages(m => [{
                    from: newMessage.sender,
                    text: newMessage.message,
                    timestamp: new Date(),
                }, ...m]);
            } else {
                console.error("Socket not available");
            }
        } catch {
            notifications.show({
                color: "red",
                message: "Internal error sending message",
            })
        }
        
    }

    function isOwnMessage(message: IMessage): boolean {
        return message.from == user.name;
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

            <ScrollArea style={{flexGrow: 1}} viewportRef={messageArea}>
                {
                    messages.map((message) => (
                        <div
                            key={new Date(message.timestamp).getTime()}
                            style={{
                                display: "flex",
                                justifyContent: isOwnMessage(message) ? 'flex-end' : 'flex-start',
                                paddingRight: 20,
                            }}
                        >
                            <MessageComponent
                                message={message}
                                own={isOwnMessage(message)}
                            ></MessageComponent>
                        </div>

                    )).reverse()

                }
            </ScrollArea>
            
            <form>
                
            </form>
            <TextInput
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
                placeholder="message"
                onKeyUp={(event) => {if (event.key == "Enter") sendMessage()}}
                rightSection={
                    <ActionIcon variant="filled" aria-label="" onClick={() => sendMessage()}><IconSend></IconSend></ActionIcon>
                }
            />
        </Stack>
    )
}