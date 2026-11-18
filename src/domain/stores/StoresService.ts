import { StoresModel } from "./StoresModel";

export type fetchStores = () => Promise<StoresModel[]>;
export type fetchStoreById = (id: string) => Promise<StoresModel>;
