import Constants from "expo-constants";
import { Platform } from "react-native";

import { StoresServiceType } from "@/domain/stores/StoresService";

const PORT = 3001;

const getHost = () => {
  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (metroHost) return metroHost;
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
};

const BASE_URL = `http://${getHost()}:${PORT}`;

export const storeService: StoresServiceType = {
  fetchStores: async (name?: string) => {
    const query = name ? `?name:contains=${encodeURIComponent(name)}` : "";
    return fetchJson(`${BASE_URL}/stores${query}`);
  },
  fetchStoreById: async (id: string) => fetchJson(`${BASE_URL}/stores/${id}`),
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};
