import { StoresModel } from "./StoresModel";

export type StoresPage = {
  stores: StoresModel[];
  nextPage: number | null;
};

export type StoresServiceType = {
  fetchStores: (name?: string, page?: number) => Promise<StoresPage>;
  fetchStoreById: (id: string) => Promise<StoresModel>;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => Promise<boolean>;
  fetchFavorites: () => Promise<StoresModel[]>;
};
