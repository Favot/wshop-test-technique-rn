import { StoresModel } from "@/domain/stores/StoresModel";
import { StoresServiceType } from "@/domain/stores/StoresService";
import {
  hasStringListItem,
  toggleStringListItem,
} from "../infrastructure/asyncStorage";
import {
  BASE_URL,
  buildPaginatedQuery,
  fetchJson,
  PaginatedResponse,
} from "../infrastructure/fetch";

export const STORES_PAGE_SIZE = 5;
export const FAVORITES_STORAGE_KEY = "favorites";

export const storeService: StoresServiceType = {
  fetchStores: async (name?: string, page = 1) => {
    const query = buildPaginatedQuery({
      filters: name ? [`name:contains=${encodeURIComponent(name)}`] : [],
      page,
      perPage: STORES_PAGE_SIZE,
    });

    const { data, next } = await fetchJson<PaginatedResponse<StoresModel>>(
      `${BASE_URL}/stores?${query}`,
    );
    return { stores: data, nextPage: next };
  },
  fetchStoreById: async (id: string) =>
    fetchJson<StoresModel>(`${BASE_URL}/stores/${id}`),
  toggleFavorite: (id: string) =>
    toggleStringListItem(FAVORITES_STORAGE_KEY, id),
  isFavorite: (id: string) => hasStringListItem(FAVORITES_STORAGE_KEY, id),
};
