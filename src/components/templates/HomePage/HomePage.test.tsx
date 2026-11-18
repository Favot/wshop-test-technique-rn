import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";

import { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";

import { HomePage } from "./HomePage";

jest.mock("@/gateway/serviceRegistry");

const STORES_COUNT = 50;

const createStore = (index: number): StoresModel => ({
  id: String(index),
  name: `Store ${index}`,
  address: `${index} rue de Paris, 75001 Paris`,
  phone: "+33 1 23 45 67 89",
  imageUrl: `https://example.com/stores/${index}.jpg`,
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
});

const stores = Array.from({ length: STORES_COUNT }, (_, i) =>
  createStore(i + 1),
);

const setup = async (fetchStores: jest.Mock) => {
  jest.mocked(getServiceRegistry).mockReturnValue({
    storesService: { fetchStores, fetchStoreById: jest.fn() },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );

  return { fetchStores, ...utils };
};

describe("HomePage", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("loading state", () => {
    it("shows a loader while the stores are being fetched", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { getByTestId, queryByTestId } = await setup(neverResolves);

      expect(getByTestId("loader")).toBeOnTheScreen();
      expect(queryByTestId("store-list")).not.toBeOnTheScreen();
    });
  });

  describe("display state", () => {
    it("hides the loader and shows the stores once fetched", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);

      const { findByTestId, queryByTestId } = await setup(fetchStores);

      expect(await findByTestId("store-list")).toBeOnTheScreen();
      await waitFor(() =>
        expect(queryByTestId("loader")).not.toBeOnTheScreen(),
      );
    });

    it("displays the first store of the list", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);

      const { findByText } = await setup(fetchStores);

      expect(await findByText("Store 1")).toBeOnTheScreen();
    });
  });
});
