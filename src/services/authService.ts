// services/authService.ts
import apiClient from '@/lib/apiClient';
import { User } from '@/types';
import axios from 'axios';

interface LoginParams {
  name_or_mail: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async login({ name_or_mail, password }: LoginParams): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        name_or_mail,
        password,
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to log in');
      }

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      // Refresh token is automatically stored in cookies by the server

      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
          // This means we got a response from the server
          const message = error.response?.data?.message || 'Invalid credentials';
          throw new Error(message);
        }
        // Other unknown errors
        throw new Error('Something went wrong');
      }
  }

  async register(userData: User): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/users', userData);
      
      if (response.status === 200) {
        return { 
          success: true, 
          message: 'Please check your email to validate your account' 
        };
      }
      
      if (response.status === 409) {
        throw new Error('User already exists');
      }

      throw new Error('Registration failed');
    } catch (error) {
        if (axios.isAxiosError(error)) {
          // This means we got a response from the server
          const message = error.response?.data?.message || 'Invalid credentials';
          throw new Error(message);
        }
        // Other unknown errors
        throw new Error('Something went wrong');
      }
  }
}

export const authService = new AuthService();