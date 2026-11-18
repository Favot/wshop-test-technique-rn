import { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import { HomePage } from "./HomePage";

jest.mock("@/gateway/serviceRegistry");

const STORES_COUNT = 50;

const createStore = (index: number): StoresModel => ({
  id: String(index),
  name: `Store ${index}`,
  address: `${index} rue de Paris, 75001 Paris`,
  phone: `01 23 45 67 ${String(index).padStart(2, "0")}`,
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

    it("displays the name, address, phone and image of a store", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);
      const [store] = stores;

      const { findByText, getByText, findByTestId } = await setup(fetchStores);

      expect(await findByText(store.name)).toBeOnTheScreen();
      expect(getByText(store.address)).toBeOnTheScreen();
      expect(getByText(store.phone)).toBeOnTheScreen();
      expect(await findByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
    });
  });

  describe("filter by name", () => {
    const fetchStoresFilteredByName = () =>
      jest.fn(async (name?: string) =>
        stores.filter((store) =>
          store.name.toLowerCase().includes((name ?? "").toLowerCase()),
        ),
      );

    it("fetches the stores matching the typed name", async () => {
      const fetchStores = fetchStoresFilteredByName();
      const user = userEvent.setup();

      const { findByTestId } = await setup(fetchStores);
      await user.type(await findByTestId("search-input"), "Store 12");

      await waitFor(() =>
        expect(fetchStores).toHaveBeenLastCalledWith("Store 12"),
      );
    });

    it("only displays the stores matching the typed name", async () => {
      const fetchStores = fetchStoresFilteredByName();
      const user = userEvent.setup();

      const { findByTestId, findByText, queryByText } =
        await setup(fetchStores);
      await user.type(await findByTestId("search-input"), "Store 12");

      expect(await findByText("Store 12")).toBeOnTheScreen();
      await waitFor(() => expect(queryByText("Store 1")).not.toBeOnTheScreen());
    });
  });

  describe("refetch on pull to refresh", () => {
    it("refetches the stores when the list is pulled down", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);

      const { findByTestId } = await setup(fetchStores);
      const list = await findByTestId("store-list");
      expect(fetchStores).toHaveBeenCalledTimes(1);

      await act(async () => {
        fireEvent(list, "refresh");
      });

      await waitFor(() => expect(fetchStores).toHaveBeenCalledTimes(2));
    });

    it("refetches with the currently typed name", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);
      const user = userEvent.setup();

      const { findByTestId } = await setup(fetchStores);
      await user.type(await findByTestId("search-input"), "Store 12");
      await waitFor(() =>
        expect(fetchStores).toHaveBeenLastCalledWith("Store 12"),
      );
      const callsBeforeRefresh = fetchStores.mock.calls.length;

      await act(async () => {
        fireEvent(await findByTestId("store-list"), "refresh");
      });

      await waitFor(() =>
        expect(fetchStores).toHaveBeenCalledTimes(callsBeforeRefresh + 1),
      );
      expect(fetchStores).toHaveBeenLastCalledWith("Store 12");
    });

    it("keeps the stores displayed while refreshing", async () => {
      const fetchStores = jest.fn().mockResolvedValue(stores);

      const { findByTestId, findByText, queryByTestId } =
        await setup(fetchStores);
      const list = await findByTestId("store-list");

      await act(async () => {
        fireEvent(list, "refresh");
      });

      expect(await findByText("Store 1")).toBeOnTheScreen();
      expect(queryByTestId("loader")).not.toBeOnTheScreen();
    });
  });
});
