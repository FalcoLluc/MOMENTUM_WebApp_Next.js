// src/services/businessService.ts
import apiClient from "@/lib/apiClient";
import { IBusiness, FilterOptions } from "@/types";

class BusinessService {
  async getFilteredBusinesses(filters: FilterOptions): Promise<IBusiness[]> {
    try {
      const { data } = await apiClient.post<{ message: string; businesses: IBusiness[] }>(
        "/business/filter",
        filters
      );
      // El backend responde { message, businesses }
      return data.businesses;
    } catch (error: any) {
      // Si es un 404 real de "no hay resultados" podemos devolver []:
      if (error.response?.status === 404) {
        console.warn("No businesses found matching the filters");
        return [];
      }
      // Para otros errores, lo mostramos y relanzamos o devolvemos vacío
      console.error("Error getting filtered businesses:", error.response?.data || error);
      return [];
    }
  }

  async searchBusinessByName(name: string): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.get(`/business/search/${encodeURIComponent(name)}`);
      return data.businesses;
    } catch (error: any) {
      console.error("Error searching business by name:", error?.response?.data || error);
      return null;
    }
  }

  async getFavoriteBusinesses(userId: string): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.get(`/business/favorites/${userId}`);
      return data.businesses;
    } catch (error: any) {
      console.error("Error getting favorite businesses:", error?.response?.data || error);
      return null;
    }
  }

  async getFilteredFavoriteBusinesses(userId: string, filters: FilterOptions): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.post(`/business/favorites/filter/${userId}`, filters);
      return data.businesses;
    } catch (error: any) {
      console.error("Error getting filtered favorite businesses:", error?.response?.data || error);
      return null;
    }
  }
}

export const businessService = new BusinessService();
