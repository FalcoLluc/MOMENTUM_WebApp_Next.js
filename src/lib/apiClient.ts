// lib/apiClient.ts
import axios from 'axios';

// Main API client for regular requests
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

// Separate client for refreshing tokens (sends cookies)
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true, // Ensures cookies are sent for refresh
});

// Function to refresh the access token
async function refreshAccessToken() {
  try {
    const response = await refreshClient.post('/auth/refresh', {});
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
}

// Add request interceptor to attach the access token
apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'ACCESS_TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite retry loops
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw refreshError; // Optionally handle logout or redirect to login
      }
    }

    // Handle invalid access token
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === 'INVALID_ACCESS_TOKEN'
    ) {
      console.error('Invalid access token:', error.response?.data?.error);
      throw new Error('Invalid access token. Please log in again.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;