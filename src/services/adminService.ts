import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { ILocation, Worker } from '@/types';

class AdminService {
  async createLocation(body: ILocation): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('location/', body);

      if (response.status === 201) {
        return {
          success: true,
          message: 'Location created successfully',
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

  async getAllLocationsOfBusiness(businessId: string): Promise<ILocation[]> {
    try {
      const { data } = await apiClient.get<{ message: string; locations: ILocation[] }>(
        `/business/${businessId}/locations`
      );
      console.log('Fetched locations:', data);
      return data.locations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific HTTP errors
        if (error.response?.status === 404) {
          throw new Error('No locations found for the specified business');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid business ID');
        }

        // Fallback for other HTTP errors
        const message = error.response?.data?.message || 'Failed to fetch locations';
        throw new Error(message);
      }

      // Handle non-Axios errors
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred while fetching locations');
    }
  }

  async createWorker(body: Worker): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('workers/multiple-locations', body);

      if (response.status === 201) {
        return {
          success: true,
          message: 'Worker created successfully',
        };
      }
      throw new Error('Creation failed');
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

  async getAllWorkersOfBusiness(businessId: string): Promise<Worker[]> {
      try {
        // Make the API call to fetch workers
        const { data } = await apiClient.get<Worker[]>(`workers/business/${businessId}`);

        // Log the fetched workers for debugging
        console.log('Fetched workers:', data);

        // Return the list of workers
        return data;
      } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle specific HTTP errors
        if (error.response?.status === 404) {
          throw new Error('No workers found for the specified business');
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid business ID');
        }

        // Fallback for other HTTP errors
        const message = error.response?.data?.message || 'Failed to fetch locations';
        throw new Error(message);
      }

      // Handle non-Axios errors
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred while fetching locations');
    }
  }
  
  async getLocationById(locationId: string): Promise<ILocation> {
    try {
      const { data } = await apiClient.get<ILocation>(`/location/${locationId}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Location not found');
        }
      }
      throw new Error('Failed to fetch location');
    }
  }

  async updateWorker(workerId: string, body: Partial<Worker>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put(`/workers/${workerId}`, body);

      if (response.status === 200) {
        return {
          success: true,
          message: "Worker updated successfully",
        };
      }
      throw new Error("Update failed");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Worker not found");
        }
        throw new Error(error.response?.data?.message || "Failed to update worker");
      }
      throw new Error("Network error - please try again");
    }
  }
}

export const adminService = new AdminService();