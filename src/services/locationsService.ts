// src/services/locationsService.ts
import apiClient from "@/lib/apiClient";
import { ILocation } from "@/types";

class LocationsService {
  async getLocationById(id: string) {
    try {
      const { data } = await apiClient.get<ILocation>(`/location/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  async getLocationsByService(serviceType: string) {
    try {
      const { data } = await apiClient.get<ILocation[]>(`/locations?service=${serviceType}`);
      return data;
    } catch (error) {
      console.error('Error fetching locations by service:', error);
      return null;
    }
  }
}

export const locationsService = new LocationsService();