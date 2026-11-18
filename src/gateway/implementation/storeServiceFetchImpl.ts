import { StoresServiceType } from "@/domain/stores/StoresService";

const BASE_URL = "http://localhost:3001";

export const storeService: StoresServiceType = {
  fetchStores: async (name?: string) => {
    const query = name ? `?name:contains=${encodeURIComponent(name)}` : "";
    const response = await fetch(`${BASE_URL}/stores${query}`);
    return response.json();
  },
  fetchStoreById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/stores/${id}`);
    return response.json();
  },
};
