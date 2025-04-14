// services/authService.ts
import apiClient from '@/lib/apiClient';
import { authClient } from '@/lib/apiClient';
import { User } from '@/types';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

interface LoginParams {
  name_or_mail: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

class AuthService {
  async loginUser({ name_or_mail, password }: LoginParams): Promise<LoginResponse> {
    try {
      const { data } = await authClient.post<LoginResponse>('/auth/login', {
        name_or_mail,
        password,
      });
      const { user, accessToken } = data;
      // Update Zustand store (it internally stores the access token)
      useAuthStore.getState().login(user, accessToken);

      return data;
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle 401 specifically
        if (error.response?.status === 401) {
          throw new Error(error.response?.data?.error || 'Invalid credentials');
        }
        // Handle other HTTP errors
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      // Handle non-Axios errors
      throw new Error('Network error - please try again');
    }
  }

  async registerUser(userData: User): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/users', userData);
  
      if (response.status === 200) {
        return {
          success: true,
          message: 'Please check your email to validate your account',
        };
      }  
      throw new Error('Registration failed');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific HTTP errors
        if (error.response?.status === 400) {
          throw new Error(error.response?.data?.message || 'Invalid input data');
        }
        if (error.response?.status === 409) {
          throw new Error('User already exists');
        }
  
        // Fallback for other HTTP errors
        const message = error.response?.data?.message || 'Registration failed';
        throw new Error(message);
      }
      // Fallback for non-Axios errors
      throw new Error('Something went wrong. Please try again later.');
    }
  }
}

export const authService = new AuthService();