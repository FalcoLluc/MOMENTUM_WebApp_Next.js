// lib/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';

const { API_URL } = getRuntimeEnv();

// Main API client (no cookies for regular requests)
const apiClient = axios.create({
  baseURL: API_URL,
});

// Auth-specific client (sends cookies for login/refresh/logout)
export const authClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Critical for cookies
});

// Interceptor to attach access token
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? useAuthStore.getState().accessToken
      : null; // Evitar liades amb SSR

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token refresh logic
export async function refreshAccessToken() {
  try {
    const response = await authClient.post('/auth/refresh'); // Uses authClient!
    const { accessToken } = response.data;
    useAuthStore.getState().setAccessToken(accessToken); // Update Zustand store -> Guardem aquí el accessToken

    return accessToken;
  } catch (error) {
    console.error('Refresh failed:', error);
    throw error;
  }
}

// Response interceptor (handles 401 errors)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.info("Acess token expired. Refreshing.");
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Force logout needed:', refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login'; // Redirect to login
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;