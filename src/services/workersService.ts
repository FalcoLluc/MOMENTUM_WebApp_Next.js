import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { authClient } from '@/lib/apiClient';
import { LoginRequestBody, NewBusinessRequestBody } from '@/types';
import { Worker } from '@/types';
import { useAuthStore } from '@/stores/authStore';
interface LoginWorkerResponse {
  worker: Worker;
  accessToken: string;
}

class WorkersService {
    async registerBusiness(body: NewBusinessRequestBody): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post('auth/registerBusiness', body);

            if (response.status === 201) {
                return {
                    success: true,
                    message: 'Register Ok',
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
                    throw new Error('Business or Worker already exists');
                }

                // Fallback for other HTTP errors
                const message = error.response?.data?.message || 'Registration failed';
                throw new Error(message);
            }
            // Handle non-Axios errors
            throw new Error('Network error - please try again');
        }
    }

    async loginWorker({ name_or_mail, password }: LoginRequestBody): Promise<LoginWorkerResponse> {
    try {
        const { data } = await authClient.post<LoginWorkerResponse>('/auth/loginWorker', {
        name_or_mail,
        password,
        });
        const { worker, accessToken } = data;
        // Update workerStore
        useAuthStore.getState().loginWorker(worker, accessToken);

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

    async logoutWorker(): Promise<void> {
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
}

export const workersService = new WorkersService();