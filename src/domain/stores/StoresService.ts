import { StoresModel } from "./StoresModel";

export type StoresServiceType = {
  fetchStores: () => Promise<StoresModel[]>;
  fetchStoreById: (id: string) => Promise<StoresModel>;
};
