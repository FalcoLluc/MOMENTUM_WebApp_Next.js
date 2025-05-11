// lib/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getRuntimeEnv } from '@/utils/getRuntimeEnv';

const { NEXT_PUBLIC_API_URL } = getRuntimeEnv();

// Main API client (no cookies for regular requests)
const apiClient = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
});

// Auth-specific client (sends cookies for login/refresh/logout)
export const authClient = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  withCredentials: true, // Critical for cookies
});

// Interceptor to attach access token
apiClient.interceptors.request.use((config) => {
  //const token = localStorage.getItem('accessToken'); // com ho tenia abans
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
async function refreshAccessToken() {
  try {
    const response = await authClient.post('/auth/refresh'); // Uses authClient!
    const { accessToken } = response.data;
    //localStorage.setItem('accessToken', accessToken);
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
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Force logout needed:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Redirect to login
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;