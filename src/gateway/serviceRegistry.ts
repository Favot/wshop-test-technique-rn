import { StoresServiceType } from "@/domain/stores/StoresService";
import { storeService } from "./implementation/storeServiceImpl";

type ServiceRegistry = {
  storesService: StoresServiceType;
};

export const getServiceRegistry = (): ServiceRegistry => {
  return {
    storesService: storeService,
  };
};
