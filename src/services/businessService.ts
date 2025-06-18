import axios from "axios";
import apiClient from "@/lib/apiClient";
import { IBusiness, FilterOptions } from "@/types";

class BusinessService {
  async getFilteredBusinesses(userId: string,filters: FilterOptions): Promise<IBusiness[]> {
    try {
      const { data } = await apiClient.post<{ message: string; businesses: IBusiness[] }>(
        `/business/filter/${userId}`,
        filters
      );
      return data.businesses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.warn("No businesses found matching the filters");
          return [];
        }
        console.error("Error getting filtered businesses:", error.response?.data?.message || "Request failed");
        throw new Error(error.response?.data?.message || "Failed to fetch filtered businesses");
      }
      throw new Error("Network error - please try again");
    }
  }

  async searchBusinessByName(name: string): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.get<{ businesses: IBusiness[] }>(
        `/business/search/${encodeURIComponent(name)}`
      );
      return data.businesses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.warn("No cities found matching the filters");
          return [];
        }
        console.error("Error searching business by name:", error.response?.data?.message || "Request failed");
        throw new Error(error.response?.data?.message || "Failed to search businesses by name");
      }
      throw new Error("Network error - please try again");
    }
  }

  async getFavoriteBusinesses(userId: string): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.get<{ businesses: IBusiness[] }>(`/business/favorites/${userId}`);
      return data.businesses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error getting favorite businesses:", error.response?.data?.message || "Request failed");
        throw new Error(error.response?.data?.message || "Failed to fetch favorite businesses");
      }
      throw new Error("Network error - please try again");
    }
  }

  async getFilteredFavoriteBusinesses(userId: string, filters: FilterOptions): Promise<IBusiness[] | null> {
    try {
      const { data } = await apiClient.post<{ businesses: IBusiness[] }>(
        `/business/favorites/filter/${userId}`,
        filters
      );
      return data.businesses;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error getting filtered favorite businesses:",
          error.response?.data?.message || "Request failed"
        );
        throw new Error(error.response?.data?.message || "Failed to fetch filtered favorite businesses");
      }
      throw new Error("Network error - please try again");
    }
  }
}

export const businessService = new BusinessService();