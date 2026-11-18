import { StoresModel } from "./StoresModel";

export type StoresPage = {
  stores: StoresModel[];
  nextPage: number | null;
};

export type StoresServiceType = {
  fetchStores: (name?: string, page?: number) => Promise<StoresPage>;
  fetchStoreById: (id: string) => Promise<StoresModel>;
};
