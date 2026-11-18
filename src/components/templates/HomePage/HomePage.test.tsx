import { StoresModel } from "@/domain/stores/StoresModel";
import type { StoresPage } from "@/domain/stores/StoresService";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import { HomePage } from "./HomePage";

jest.mock("@/gateway/serviceRegistry");

const STORES_COUNT = 50;
const PAGE_SIZE = 5;

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

const fetchStoresByPage = (source: StoresModel[] = stores) =>
  jest.fn(async (name = "", page = 1): Promise<StoresPage> => {
    const matching = source.filter((store) =>
      store.name.toLowerCase().includes(name.toLowerCase()),
    );
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      stores: matching.slice(start, end),
      nextPage: end < matching.length ? page + 1 : null,
    };
  });

const queryClients: QueryClient[] = [];

const setup = async (fetchStores: jest.Mock) => {
  jest.mocked(getServiceRegistry).mockReturnValue({
    storesService: {
      fetchStores,
      fetchStoreById: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn(),
      fetchFavorites: jest.fn(),
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  queryClients.push(queryClient);

  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );

  return { fetchStores, ...utils };
};

const endReached = async (list: Parameters<typeof fireEvent>[0]) => {
  await act(async () => {
    fireEvent(list, "endReached");
  });
};

describe("HomePage", () => {
  afterEach(async () => {
    cleanup();
    await Promise.all(queryClients.map((client) => client.cancelQueries()));
    queryClients.splice(0).forEach((client) => client.clear());
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
      const fetchStores = fetchStoresByPage();

      const { findByTestId, queryByTestId } = await setup(fetchStores);

      expect(await findByTestId("store-list")).toBeOnTheScreen();
      await waitFor(() =>
        expect(queryByTestId("loader")).not.toBeOnTheScreen(),
      );
    });

    it("displays the first store of the list", async () => {
      const fetchStores = fetchStoresByPage();

      const { findByText } = await setup(fetchStores);

      expect(await findByText("Store 1")).toBeOnTheScreen();
    });

    it("displays the name, address, phone and image of a store", async () => {
      const fetchStores = fetchStoresByPage();
      const [store] = stores;

      const { findByText, getByText, findByTestId } = await setup(fetchStores);

      expect(await findByText(store.name)).toBeOnTheScreen();
      expect(getByText(store.address)).toBeOnTheScreen();
      expect(getByText(store.phone)).toBeOnTheScreen();
      expect(await findByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
    });
  });

  describe("infinite scroll", () => {
    it("only fetches the first batch of stores on mount", async () => {
      const fetchStores = fetchStoresByPage();

      const { findByText, queryByText } = await setup(fetchStores);

      expect(await findByText("Store 5")).toBeOnTheScreen();
      expect(queryByText("Store 6")).not.toBeOnTheScreen();
      expect(fetchStores).toHaveBeenCalledTimes(1);
      expect(fetchStores).toHaveBeenCalledWith("", 1);
    });

    it("fetches the next batch when the end of the list is reached", async () => {
      const fetchStores = fetchStoresByPage();

      const { findByTestId } = await setup(fetchStores);
      await endReached(await findByTestId("store-list"));

      await waitFor(() => expect(fetchStores).toHaveBeenCalledTimes(2));
      expect(fetchStores).toHaveBeenLastCalledWith("", 2);
    });

    it("appends the next batch to the stores already displayed", async () => {
      const fetchStores = fetchStoresByPage();

      const { findByTestId, findByText, getByText } = await setup(fetchStores);
      await endReached(await findByTestId("store-list"));

      expect(await findByText("Store 6")).toBeOnTheScreen();
      expect(getByText("Store 10")).toBeOnTheScreen();
      expect(getByText("Store 1")).toBeOnTheScreen();
    });

    it("shows a loader at the bottom while the next batch is loading", async () => {
      const fetchStores = fetchStoresByPage();
      const { findByTestId, queryByTestId } = await setup(fetchStores);
      const list = await findByTestId("store-list");

      let resolveNextPage: (page: StoresPage) => void = () => {};
      fetchStores.mockReturnValueOnce(
        new Promise<StoresPage>((resolve) => {
          resolveNextPage = resolve;
        }),
      );
      await endReached(list);

      expect(await findByTestId("next-page-loader")).toBeOnTheScreen();

      await act(async () => {
        resolveNextPage({ stores: [], nextPage: null });
      });

      await waitFor(() =>
        expect(queryByTestId("next-page-loader")).not.toBeOnTheScreen(),
      );
    });

    it("does not fetch another batch while one is already loading", async () => {
      const fetchStores = fetchStoresByPage();
      const { findByTestId } = await setup(fetchStores);
      const list = await findByTestId("store-list");

      fetchStores.mockReturnValueOnce(new Promise(() => {}));
      await endReached(list);
      await endReached(list);

      expect(fetchStores).toHaveBeenCalledTimes(2);
    });

    it("stops fetching once the last batch has been loaded", async () => {
      const fetchStores = fetchStoresByPage(stores.slice(0, 7));

      const { findByTestId, findByText } = await setup(fetchStores);
      const list = await findByTestId("store-list");
      await endReached(list);
      expect(await findByText("Store 7")).toBeOnTheScreen();

      await endReached(list);

      expect(fetchStores).toHaveBeenCalledTimes(2);
    });

    it("restarts from the first batch when the typed name changes", async () => {
      const fetchStores = fetchStoresByPage();
      const user = userEvent.setup();

      const { findByTestId } = await setup(fetchStores);
      await endReached(await findByTestId("store-list"));
      await waitFor(() => expect(fetchStores).toHaveBeenCalledTimes(2));

      await user.type(await findByTestId("search-input"), "Store 2");

      await waitFor(() =>
        expect(fetchStores).toHaveBeenLastCalledWith("Store 2", 1),
      );
    });
  });

  describe("filter by name", () => {
    it("fetches the stores matching the typed name", async () => {
      const fetchStores = fetchStoresByPage();
      const user = userEvent.setup();

      const { findByTestId } = await setup(fetchStores);
      await user.type(await findByTestId("search-input"), "Store 12");

      await waitFor(() =>
        expect(fetchStores).toHaveBeenLastCalledWith("Store 12", 1),
      );
    });

    it("only displays the stores matching the typed name", async () => {
      const fetchStores = fetchStoresByPage();
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
      const fetchStores = fetchStoresByPage();

      const { findByTestId } = await setup(fetchStores);
      const list = await findByTestId("store-list");
      expect(fetchStores).toHaveBeenCalledTimes(1);

      await act(async () => {
        fireEvent(list, "refresh");
      });

      await waitFor(() => expect(fetchStores).toHaveBeenCalledTimes(2));
      expect(fetchStores).toHaveBeenLastCalledWith("", 1);
    });

    it("refetches with the currently typed name", async () => {
      const fetchStores = fetchStoresByPage();
      const user = userEvent.setup();

      const { findByTestId } = await setup(fetchStores);
      await user.type(await findByTestId("search-input"), "Store 12");
      await waitFor(() =>
        expect(fetchStores).toHaveBeenLastCalledWith("Store 12", 1),
      );
      const callsBeforeRefresh = fetchStores.mock.calls.length;

      await act(async () => {
        fireEvent(await findByTestId("store-list"), "refresh");
      });

      await waitFor(() =>
        expect(fetchStores).toHaveBeenCalledTimes(callsBeforeRefresh + 1),
      );
      expect(fetchStores).toHaveBeenLastCalledWith("Store 12", 1);
    });

    it("keeps the stores displayed while refreshing", async () => {
      const fetchStores = fetchStoresByPage();

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
