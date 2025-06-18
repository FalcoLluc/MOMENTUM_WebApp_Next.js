// services/authService.ts
import apiClient from '@/lib/apiClient';
import { authClient } from '@/lib/apiClient';
import { User, LoginRequestBody } from '@/types';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

interface LoginResponse {
  user: User;
  accessToken: string;
}

class AuthService {
  async loginUser({ name_or_mail, password }: LoginRequestBody): Promise<LoginResponse> {
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

  async logoutUser(): Promise<void> {
    try {
      // Clear the access token from Zustand store immediately
      useAuthStore.getState().logout();
      
      // Make the API call to invalidate the refresh token
      await authClient.post('/auth/logout');
      
      // Optional: Redirect could be handled here or in the component
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Even if the API call fails, we should clear local state
        console.error('Logout API error:', error.response?.data?.message || 'Logout failed');
      }
      // Re-throw the error so components can handle it if needed
      throw new Error('Logout failed - please try again');
    }
  }

  async updateUserPassword(
    userId: string, 
    data: { currentPassword: string; newPassword: string }
  ): Promise<{ message: string; user?: User }> {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        if (status === 404) {
          throw new Error('User not found');
        }
        if (status === 401) {
          throw new Error('Current password is incorrect');
        }
        throw new Error(responseData?.error || 'Failed to update password');
      }
      throw new Error('Network error - please try again');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await apiClient.get('/auth/validateLogin', {
        // Don't throw on 401/403 - we'll handle it manually
        validateStatus: (status) => status < 500
      });
      
      // Consider 200-299 as valid responses
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  async verifyUser(username: string, requestId: string): Promise<void> {
    return apiClient.get(`/users/activate/${username}/${requestId}`);
  }

}

export const authService = new AuthService();