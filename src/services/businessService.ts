import axios from 'axios';
import apiClient from '@/lib/apiClient';

export interface BusinessRegisterRequestBody {
    name: string;
    age: number;
    mail: string;
    password: string;
    businessName: string;
}

class BusinessService {
    async registerBusiness(body: BusinessRegisterRequestBody): Promise<{ success: boolean; message: string }> {
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
}

export const businessService = new BusinessService();