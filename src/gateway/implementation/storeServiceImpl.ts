import { StoresServiceType } from "@/domain/stores/StoresService";
import {
  BASE_URL,
  buildPaginatedQuery,
  fetchJson,
  hasStringListItem,
  PaginatedResponse,
  readStringList,
  toggleStringListItem,
} from "../infrastructure";
import { StoreDto, toStoresModel } from "./storeMapper";

const fetchStoreDto = (id: string) =>
  fetchJson<StoreDto>(`${BASE_URL}/stores/${id}`);

export const STORES_PAGE_SIZE = 10;
export const FAVORITES_STORAGE_KEY = "favorites";

export const storeService: StoresServiceType = {
  fetchStores: async (name?: string, page = 1) => {
    const query = buildPaginatedQuery({
      filters: name ? [`name:contains=${encodeURIComponent(name)}`] : [],
      page,
      perPage: STORES_PAGE_SIZE,
    });

    const { data, next } = await fetchJson<PaginatedResponse<StoreDto>>(
      `${BASE_URL}/stores?${query}`,
    );
    return { stores: data.map(toStoresModel), nextPage: next };
  },
  fetchStoreById: async (id: string) => toStoresModel(await fetchStoreDto(id)),
  toggleFavorite: (id: string) =>
    toggleStringListItem(FAVORITES_STORAGE_KEY, id),
  isFavorite: (id: string) => hasStringListItem(FAVORITES_STORAGE_KEY, id),
  fetchFavorites: async () => {
    const favorites = await readStringList(FAVORITES_STORAGE_KEY);
    const dtos = await Promise.all(favorites.map(fetchStoreDto));
    return dtos.map(toStoresModel);
  },
};
