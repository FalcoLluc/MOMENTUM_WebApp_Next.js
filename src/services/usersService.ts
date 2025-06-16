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

}

export const usersService = new UsersService();