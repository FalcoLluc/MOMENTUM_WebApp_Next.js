// src/services/usersService.ts
import apiClient from "@/lib/apiClient";
import { ILocation, User } from "@/types";  // Define o importa tu interfaz IUser con los datos de usuario

class UsersService {
  async searchUsersByName(name: string): Promise<User[] | undefined> {
    try {
      const { data } = await apiClient.get<User[]>(`/users/search?name=${name}`);
      return data;
    } catch (error) {
      console.error('Error searching users by name:', error);
    }
  }
    async followUser(followerId: string, followeeId: string): Promise<{ message: string; user: User } | undefined> {
    try {
      const { data } = await apiClient.post<{ message: string; user: User }>(
        `/users/follow/${followerId}/${followeeId}`
      );
      return data;
    } catch (error) {
      console.error('Error following user:', error);
    }
  }

    async unfollowUser(followerId: string, followeeId: string): Promise<{ message: string; user: User } | undefined> {
    try {
      const { data } = await apiClient.post<{ message: string; user: User }>(
        `/users/unfollow/${followerId}/${followeeId}`
      );
      return data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  }

  async getCloseMedicalLocations(lat: number, lon: number): Promise<ILocation[] | undefined> {
    try {
      const { data } = await apiClient.get<ILocation[]>(`location/medical?lat=${lat}&lon=${lon}`);
      return data;
    } catch (error) {
      console.error('Error fetching nearby medical locations:', error);
    }
  }

  async getFriends(userId: string): Promise<{_id: string, mail: string}[]> {
    const res = await apiClient.get<{friends: {_id: string, mail: string}[]}>(
      `/users/${userId}/friends`
    );
    return res.data.friends;
  }

  async getFriendRequests(userId: string): Promise<{_id: string, mail: string}[]> {
    const res = await apiClient.get<{requests: {_id: string, mail: string}[]}>(
      `/users/${userId}/friend-requests`
    );
    return res.data.requests;
  }

  async sendFriendRequest(fromId: string, toId: string): Promise<void> {
    await apiClient.post(`/users/${fromId}/friend-request`, {toId});
  }

  async acceptFriendRequest(fromId: string, toId: string): Promise<void> {
    await apiClient.post(`/users/${toId}/accept-friend`, {fromId});
  }

  async searchUserByEmail(query: string): Promise<{_id: string, mail: string}[]> {
    const res = await apiClient.post<{users: {_id: string, mail: string}[]}>(`/users/search-by-email`, {
      q: query,
    });
    return res.data.users;
  }
}

export const usersService = new UsersService();