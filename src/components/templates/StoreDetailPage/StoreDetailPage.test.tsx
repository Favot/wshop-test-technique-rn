import { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react-native";

import { StoreDetailPage } from "./StoreDetailPage";

jest.mock("@/gateway/serviceRegistry");

const store: StoresModel = {
  id: "1",
  name: "Boutique République",
  address: "12 avenue de la République, 75011 Paris",
  phone: "01 23 45 67 89",
  imageUrl: "https://example.com/stores/1.jpg",
  openingHours: {
    monday: [{ open: "09:00", close: "18:00" }],
    tuesday: [{ open: "09:00", close: "18:00" }],
    wednesday: [{ open: "09:00", close: "18:00" }],
    thursday: [{ open: "09:00", close: "18:00" }],
    friday: [{ open: "09:00", close: "18:00" }],
    saturday: [{ open: "10:00", close: "17:00" }],
    sunday: [],
  },
  location: { latitude: 48.8566, longitude: 2.3522 },
};

const queryClients: QueryClient[] = [];

const setup = async (fetchStoreById: jest.Mock, id = store.id) => {
  jest.mocked(getServiceRegistry).mockReturnValue({
    storesService: { fetchStores: jest.fn(), fetchStoreById },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  queryClients.push(queryClient);

  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <StoreDetailPage id={id} />
    </QueryClientProvider>,
  );

  return { fetchStoreById, ...utils };
};

describe("StoreDetailPage", () => {
  afterEach(async () => {
    cleanup();
    await Promise.all(queryClients.map((client) => client.cancelQueries()));
    queryClients.splice(0).forEach((client) => client.clear());
    jest.resetAllMocks();
  });

  describe("loading state", () => {
    it("shows a loader while the store is being fetched", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { getByTestId, queryByText, queryByTestId } =
        await setup(neverResolves);

      expect(getByTestId("loader")).toBeOnTheScreen();
      expect(queryByText(store.name)).not.toBeOnTheScreen();
      expect(queryByTestId("error")).not.toBeOnTheScreen();
    });
  });

  describe("fetching", () => {
    it("fetches the store matching the given id", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      await setup(fetchStoreById, "1");

      await waitFor(() => expect(fetchStoreById).toHaveBeenCalledTimes(1));
      expect(fetchStoreById).toHaveBeenCalledWith("1");
    });
  });

  describe("display state", () => {
    it("hides the loader once the store is fetched", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByText, queryByTestId } = await setup(fetchStoreById);

      expect(await findByText(store.name)).toBeOnTheScreen();
      expect(queryByTestId("loader")).not.toBeOnTheScreen();
    });

    it("displays the name, address, phone and image of the store", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByText, getByText, findByTestId } =
        await setup(fetchStoreById);

      expect(await findByText(store.name)).toBeOnTheScreen();
      expect(getByText(store.address)).toBeOnTheScreen();
      expect(getByText(store.phone)).toBeOnTheScreen();
      expect(await findByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
    });
  });

  describe("error state", () => {
    it("shows an error message when the store cannot be fetched", async () => {
      const fetchStoreById = jest.fn().mockRejectedValue(new Error("boom"));

      const { findByTestId, getByText, queryByTestId } =
        await setup(fetchStoreById);

      expect(await findByTestId("error")).toBeOnTheScreen();
      expect(getByText("Impossible de charger ce magasin.")).toBeOnTheScreen();
      expect(queryByTestId("loader")).not.toBeOnTheScreen();
    });

    it("does not display any store information on error", async () => {
      const fetchStoreById = jest.fn().mockRejectedValue(new Error("boom"));

      const { findByTestId, queryByText } = await setup(fetchStoreById);

      await findByTestId("error");
      expect(queryByText(store.name)).not.toBeOnTheScreen();
    });
  });
});
