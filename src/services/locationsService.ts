// src/services/locationsService.ts
import apiClient from "@/lib/apiClient";
import { ILocation } from "@/types";
import { LocationServiceType } from "@/types/enums";

class LocationsService {
  async getLocationById(id: string) {
    try {
      const { data } = await apiClient.get<ILocation>(`/location/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllLocationsByServiceType(serviceType: LocationServiceType) {
    try {
      const { data } = await apiClient.get<ILocation[]>(`/location/serviceType/${serviceType}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
export const locationsService = new LocationsService();