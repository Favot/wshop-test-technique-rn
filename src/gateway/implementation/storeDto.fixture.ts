import type { StoresModel } from "@/domain/stores/StoresModel";
import type { StoreDto } from "./storeMapper";

export const makeStoreDto = (id = "1"): StoreDto => ({
  id,
  name: `Store ${id}`,
  address: "12 avenue de la République, 75011 Paris",
  latitude: 48.8674,
  longitude: 2.3636,
  phone: "01 23 45 67 89",
  imageUrl: `https://picsum.photos/seed/store-${id}/600/400`,
  openingHours: {
    monday: [{ open: "09:00", close: "19:00" }],
    tuesday: [{ open: "09:00", close: "19:00" }],
    wednesday: [{ open: "09:00", close: "19:00" }],
    thursday: [{ open: "09:00", close: "19:00" }],
    friday: [{ open: "09:00", close: "19:00" }],
    saturday: [{ open: "10:00", close: "18:00" }],
    sunday: [],
  },
});

export const makeStoreModel = (id = "1"): StoresModel => {
  const { latitude, longitude, ...rest } = makeStoreDto(id);
  return { ...rest, location: { latitude, longitude } };
};
