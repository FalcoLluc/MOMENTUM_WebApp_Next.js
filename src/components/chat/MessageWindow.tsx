'use client'

import { chatService } from "@/services/chatService";
import { ChatListItem, IChat, IMessage, User, Worker } from "@/types";
import { ActionIcon, Button, Menu, Paper, ScrollArea, Stack, Text, TextInput, useMantineTheme } from "@mantine/core"
import { notifications } from "@mantine/notifications";
import { IconSend, IconTrash, IconUserCheck } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageComponent } from "./MessageComponent";
import { useSocket } from "@/stores/socketStore";
import { ChatUserType } from "@/types/enums";

interface SocketMessage {
    chatId: string,
    sender: string,
    message: string,
}

export function MessageWindow ({chat, user}: {chat: ChatListItem, user: User | Worker}) {
    const theme = useMantineTheme();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const [currentChat, setCurrentChat] = useState<IChat | null>(null);
    const [message, setMessage] = useState<string>("");
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
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
                const res = await chatService.getChat(chat[1], chat[3]);
                setCurrentChat(res.data);
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

    // Checks if reader of the chat (me) is a location. False if I'm chatting
    // with a location
    const isLocationChat = user._id != chat[3] && chat[2] == ChatUserType.LOCATION;


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

    // only used to assign location chats to a worker
    async function assignClient() {
        if (!currentChat) return;

        let changes;
        try {
            if (chat[3] == currentChat?.user1._id ) {
                // the location is user1
                changes = {
                    user1: user._id,
                    typeOfUser1: "worker",
                }
            } else {
                // the location is user2
                changes = {
                    user2: user._id,
                    typeOfUser2: "worker",
                }
            }

            await chatService.editChat(currentChat._id!, changes);
            window.location.reload();
        } catch {
            notifications.show({
                message: "Error updating chat",
                color: "red",
            });
        }
    }

    async function deleteChat() {
        try {
            const chatId = currentChat?._id;
            if (!chatId) return;
            
            await chatService.deleteChat(chatId);
            window.location.reload();
        } catch {
            notifications.show({
                message: "Error deleting chat",
                color: "red",
            });
        }
    }

    return (
        <Stack style={{height: "100%"}}>
            <Paper 
                style={{
                    backgroundColor: theme.colors.blue[7],
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    padding: "4px",
                    paddingLeft: "8px",
                }}
            >
                <Text 
                    size="lg"
                    fw="500"
                    c="white"
                >{chat[0]}</Text>
                <div style={{flexGrow: 1}}></div>
                <Menu opened={deleteConfirmation} onChange={setDeleteConfirmation}>
                    <Menu.Target>
                        <ActionIcon><IconTrash/></ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label style={{fontSize: "1rem"}}>Delete Chat?</Menu.Label>
                        <Menu.Item color="red" onClick={deleteChat}>Yes</Menu.Item>
                        <Menu.Item color="green" onClick={() => setDeleteConfirmation(false)}>No</Menu.Item>
                    </Menu.Dropdown>
                </Menu>

                { isLocationChat ? 
                    <Button leftSection={<IconUserCheck/>} size="compact-sm" onClick={assignClient}>
                        Assign Client
                    </Button>
                    : null
                }

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