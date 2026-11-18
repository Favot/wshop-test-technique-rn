import { StoresModel } from "@/domain/stores/StoresModel";
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

import { FavoritePage } from "./FavoritePage";

jest.mock("@/gateway/serviceRegistry");

const FAVORITES_COUNT = 12;

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

const favorites = Array.from({ length: FAVORITES_COUNT }, (_, i) =>
  createStore(i + 1),
);

const queryClients: QueryClient[] = [];

const setup = async (fetchFavorites: jest.Mock) => {
  jest.mocked(getServiceRegistry).mockReturnValue({
    storesService: {
      fetchStores: jest.fn(),
      fetchStoreById: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn(),
      fetchFavorites,
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  queryClients.push(queryClient);

  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <FavoritePage />
    </QueryClientProvider>,
  );

  return { fetchFavorites, ...utils };
};

describe("FavoritePage", () => {
  afterEach(async () => {
    cleanup();
    await Promise.all(queryClients.map((client) => client.cancelQueries()));
    queryClients.splice(0).forEach((client) => client.clear());
    jest.resetAllMocks();
  });

  describe("loading state", () => {
    it("shows a loader while the favorites are being fetched", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { getByTestId, queryByTestId } = await setup(neverResolves);

      expect(getByTestId("loader")).toBeOnTheScreen();
      expect(queryByTestId("store-list")).not.toBeOnTheScreen();
    });
  });

  describe("display state", () => {
    it("hides the loader and shows the favorites once fetched", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);

      const { findByTestId, queryByTestId } = await setup(fetchFavorites);

      expect(await findByTestId("store-list")).toBeOnTheScreen();
      await waitFor(() =>
        expect(queryByTestId("loader")).not.toBeOnTheScreen(),
      );
    });

    it("fetches the favorites once on mount", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);

      const { findByText } = await setup(fetchFavorites);

      expect(await findByText("Store 1")).toBeOnTheScreen();
      expect(fetchFavorites).toHaveBeenCalledTimes(1);
    });

    it("displays the name, address, phone and image of a favorite", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const [store] = favorites;

      const { findByText, getByText, findByTestId } =
        await setup(fetchFavorites);

      expect(await findByText(store.name)).toBeOnTheScreen();
      expect(getByText(store.address)).toBeOnTheScreen();
      expect(getByText(store.phone)).toBeOnTheScreen();
      expect(await findByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
    });

    it("displays no store when there is no favorite", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue([]);

      const { findByTestId, queryByText } = await setup(fetchFavorites);

      expect(await findByTestId("store-list")).toBeOnTheScreen();
      expect(queryByText(/Store/)).not.toBeOnTheScreen();
    });
  });

  describe("empty state", () => {
    it("shows a message when there is no favorite yet", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue([]);

      const { findByTestId, getByText } = await setup(fetchFavorites);

      expect(await findByTestId("empty-favorites")).toBeOnTheScreen();
      expect(getByText("Aucun favori pour le moment")).toBeOnTheScreen();
    });

    it("does not show the message while the favorites are loading", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { queryByTestId } = await setup(neverResolves);

      expect(queryByTestId("empty-favorites")).not.toBeOnTheScreen();
    });

    it("does not show the message when there are favorites", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);

      const { findByText, queryByTestId } = await setup(fetchFavorites);

      expect(await findByText("Store 1")).toBeOnTheScreen();
      expect(queryByTestId("empty-favorites")).not.toBeOnTheScreen();
    });

    it("does not show the message when the search matches no favorite", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const user = userEvent.setup();

      const { findByTestId, queryByText, queryByTestId } =
        await setup(fetchFavorites);
      await user.type(await findByTestId("search-input"), "unknown");

      await waitFor(() => expect(queryByText("Store 1")).not.toBeOnTheScreen());
      expect(queryByTestId("empty-favorites")).not.toBeOnTheScreen();
    });

    it("shows the message once a refresh returns no favorite", async () => {
      const fetchFavorites = jest
        .fn()
        .mockResolvedValueOnce(favorites.slice(0, 2))
        .mockResolvedValue([]);

      const { findByTestId, findByText } = await setup(fetchFavorites);
      const list = await findByTestId("store-list");
      expect(await findByText("Store 1")).toBeOnTheScreen();

      await act(async () => {
        fireEvent(list, "refresh");
      });

      expect(await findByTestId("empty-favorites")).toBeOnTheScreen();
    });
  });

  describe("filter by name", () => {
    it("only displays the favorites matching the typed name", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const user = userEvent.setup();

      const { findByTestId, findByText, queryByText } =
        await setup(fetchFavorites);
      await user.type(await findByTestId("search-input"), "Store 12");

      expect(await findByText("Store 12")).toBeOnTheScreen();
      await waitFor(() => expect(queryByText("Store 1")).not.toBeOnTheScreen());
    });

    it("ignores the case of the typed name", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const user = userEvent.setup();

      const { findByTestId, findByText, queryByText } =
        await setup(fetchFavorites);
      await user.type(await findByTestId("search-input"), "store 12");

      expect(await findByText("Store 12")).toBeOnTheScreen();
      await waitFor(() => expect(queryByText("Store 2")).not.toBeOnTheScreen());
    });

    it("does not refetch when the typed name changes", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const user = userEvent.setup();

      const { findByTestId, findByText } = await setup(fetchFavorites);
      await user.type(await findByTestId("search-input"), "Store 12");

      expect(await findByText("Store 12")).toBeOnTheScreen();
      expect(fetchFavorites).toHaveBeenCalledTimes(1);
    });

    it("displays all the favorites again once the name is cleared", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);
      const user = userEvent.setup();

      const { findByTestId, findByText, queryByText } =
        await setup(fetchFavorites);
      const input = await findByTestId("search-input");
      await user.type(input, "Store 12");
      await waitFor(() => expect(queryByText("Store 2")).not.toBeOnTheScreen());

      await user.clear(input);

      expect(await findByText("Store 2")).toBeOnTheScreen();
    });
  });

  describe("refetch on pull to refresh", () => {
    it("refetches the favorites when the list is pulled down", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);

      const { findByTestId } = await setup(fetchFavorites);
      const list = await findByTestId("store-list");
      expect(fetchFavorites).toHaveBeenCalledTimes(1);

      await act(async () => {
        fireEvent(list, "refresh");
      });

      await waitFor(() => expect(fetchFavorites).toHaveBeenCalledTimes(2));
    });

    it("displays the newly fetched favorites after a refresh", async () => {
      const fetchFavorites = jest
        .fn()
        .mockResolvedValueOnce(favorites.slice(0, 2))
        .mockResolvedValue(favorites.slice(0, 3));

      const { findByTestId, findByText, queryByText } =
        await setup(fetchFavorites);
      const list = await findByTestId("store-list");
      expect(await findByText("Store 2")).toBeOnTheScreen();
      expect(queryByText("Store 3")).not.toBeOnTheScreen();

      await act(async () => {
        fireEvent(list, "refresh");
      });

      expect(await findByText("Store 3")).toBeOnTheScreen();
    });

    it("keeps the favorites displayed while refreshing", async () => {
      const fetchFavorites = jest.fn().mockResolvedValue(favorites);

      const { findByTestId, findByText, queryByTestId } =
        await setup(fetchFavorites);
      const list = await findByTestId("store-list");

      await act(async () => {
        fireEvent(list, "refresh");
      });

      expect(await findByText("Store 1")).toBeOnTheScreen();
      expect(queryByTestId("loader")).not.toBeOnTheScreen();
    });
  });
});
