import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { StoresModel } from "@/domain/stores/StoresModel";
import { StoresServiceType } from "@/domain/stores/StoresService";

const PORT = 3001;

const getHost = () => {
  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (metroHost) return metroHost;
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
};

const BASE_URL = `http://${getHost()}:${PORT}`;

export const STORES_PAGE_SIZE = 5;
export const FAVORITES_STORAGE_KEY = "favorites";

type PaginatedResponse<T> = {
  data: T[];
  next: number | null;
};

export const storeService: StoresServiceType = {
  fetchStores: async (name?: string, page = 1) => {
    const filters = name ? [`name:contains=${encodeURIComponent(name)}`] : [];
    const query = [
      ...filters,
      `_page=${page}`,
      `_per_page=${STORES_PAGE_SIZE}`,
    ].join("&");

    const { data, next }: PaginatedResponse<StoresModel> = await fetchJson(
      `${BASE_URL}/stores?${query}`,
    );
    return { stores: data, nextPage: next };
  },
  fetchStoreById: async (id: string) => fetchJson(`${BASE_URL}/stores/${id}`),
  toggleFavorite: async (id: string) => {
    const favorites = await readFavorites();
    const next = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  },
  isFavorite: async (id: string) => (await readFavorites()).includes(id),
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};

const readFavorites = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};
