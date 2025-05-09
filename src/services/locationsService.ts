// src/services/locationsService.ts
import apiClient from "@/lib/apiClient";
import { ILocation } from "@/types";
import { locationServiceType } from "@/types/enums";

class LocationsService {
  async getLocationById(id: string) {
    try {
      const { data } = await apiClient.get<ILocation>(`/location/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllLocationsByServiceType(serviceType: locationServiceType) {
    try {
      const { data } = await apiClient.get<ILocation[]>(`/location/serviceType/${serviceType}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
export const locationsService = new LocationsService();