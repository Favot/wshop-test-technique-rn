import type { StoresModel } from "@/domain/stores/StoresModel";

/**
 * Shape of a store as returned by the API (see `db.json`): coordinates are
 * flat `latitude` / `longitude` fields.
 */
export type StoreDto = Omit<StoresModel, "location"> & {
  latitude: number;
  longitude: number;
};

export const toStoresModel = ({
  latitude,
  longitude,
  ...store
}: StoreDto): StoresModel => ({
  ...store,
  location: { latitude, longitude },
});
