import { StoresModel } from "./StoresModel";

export type StoresServiceType = {
  fetchStores: (name?: string) => Promise<StoresModel[]>;
  fetchStoreById: (id: string) => Promise<StoresModel>;
};
