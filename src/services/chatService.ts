import apiClient from "@/lib/apiClient";
import { IChat } from "@/types";

class ChatService {
    async getChats(userId: string) {
        return await apiClient.get<[name: string, id: string][]>(`/chat/people/${userId}`);
    }

    async getChat(user1ID: string, user2ID: string) {
        return await apiClient.get<IChat>(`/chat/${user1ID}/${user2ID}`);
    }

    async createChat(user1ID: string, user2ID: string) {
        return await apiClient.post(`/chat/create`, {user1ID, user2ID});
    }

    async getLastMessages(chatId: string) {
        return await apiClient.get(`/chat/messages/${chatId}`);
    }

    async sendMessage(chatId: string, userFrom: string, message: string) {
        return await apiClient.post(`/chat/send`, {chatId, userFrom, message});
    }
}

export const chatService = new ChatService();