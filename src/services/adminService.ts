import axios from 'axios';
import apiClient from '@/lib/apiClient';
import { ILocation } from '@/types';

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
            const { data } = await apiClient.get<{ message: string; locations: ILocation[] }>(`/business/${businessId}/locations`);
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
}

export const adminService = new AdminService();