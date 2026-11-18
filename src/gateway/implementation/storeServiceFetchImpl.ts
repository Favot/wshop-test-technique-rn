import { StoresServiceType } from "@/domain/stores/StoresService";

const BASE_URL = "http://localhost:3001";

export const storeService: StoresServiceType = {
  fetchStores: async () => {
    const response = await fetch(`${BASE_URL}/stores`);
    return response.json();
  },
  fetchStoreById: async (id: string) => {
    const response = await fetch(`${BASE_URL}/stores/${id}`);
    return response.json();
  },
};
