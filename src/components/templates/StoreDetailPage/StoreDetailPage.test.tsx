import { StoresModel } from "@/domain/stores/StoresModel";
import { getServiceRegistry } from "@/gateway/serviceRegistry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react-native";

import { StoreDetailPage } from "./StoreDetailPage";

jest.mock("@/gateway/serviceRegistry");

const mockRenderMap = jest.fn();
jest.mock("expo-maps", () => {
  const { View } = jest.requireActual("react-native");
  const MapView = (props: object) => {
    mockRenderMap(props);
    return <View testID="store-map" />;
  };
  return { AppleMaps: { View: MapView }, GoogleMaps: { View: MapView } };
});

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

const createFavoritesFake = (initialFavorites: string[] = []) => {
  const favorites = new Set(initialFavorites);
  return {
    isFavorite: jest.fn(async (id: string) => favorites.has(id)),
    toggleFavorite: jest.fn(async (id: string) => {
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
    }),
  };
};

type SetupOptions = {
  id?: string;
  favorites?: ReturnType<typeof createFavoritesFake>;
};

const setup = async (
  fetchStoreById: jest.Mock,
  { id = store.id, favorites = createFavoritesFake() }: SetupOptions = {},
) => {
  jest.mocked(getServiceRegistry).mockReturnValue({
    storesService: {
      fetchStores: jest.fn(),
      fetchStoreById,
      toggleFavorite: favorites.toggleFavorite,
      isFavorite: favorites.isFavorite,
      fetchFavorites: jest.fn(),
    },
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

  return { fetchStoreById, favorites, ...utils };
};

describe("StoreDetailPage", () => {
  afterEach(async () => {
    await Promise.all(queryClients.map((client) => client.cancelQueries()));
    // Let react-query flush its batched notifications while the tree is still
    // mounted, so no update lands outside of act() after the test is over.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    cleanup();
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

      await setup(fetchStoreById, { id: "1" });

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

  describe("opening hours", () => {
    it("displays the opening hours of every day of the week", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByTestId, getByText } = await setup(fetchStoreById);

      expect(await findByTestId("opening-hours")).toBeOnTheScreen();
      expect(getByText("Horaires")).toBeOnTheScreen();
      [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche",
      ].forEach((day) => expect(getByText(day)).toBeOnTheScreen());
    });

    it("displays the opening and closing time of a day", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByTestId } = await setup(fetchStoreById);

      const monday = within(await findByTestId("opening-hours-monday"));
      expect(monday.getByText("Lundi")).toBeOnTheScreen();
      expect(monday.getByText("09:00 - 18:00")).toBeOnTheScreen();

      const saturday = within(await findByTestId("opening-hours-saturday"));
      expect(saturday.getByText("10:00 - 17:00")).toBeOnTheScreen();
    });

    it("displays all the time ranges of a day split in several ranges", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue({
        ...store,
        openingHours: {
          ...store.openingHours,
          monday: [
            { open: "09:00", close: "12:00" },
            { open: "14:00", close: "18:00" },
          ],
        },
      });

      const { findByTestId } = await setup(fetchStoreById);

      const monday = within(await findByTestId("opening-hours-monday"));
      expect(
        monday.getByText("09:00 - 12:00, 14:00 - 18:00"),
      ).toBeOnTheScreen();
    });

    it("displays a day without any time range as closed", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByTestId } = await setup(fetchStoreById);

      const sunday = within(await findByTestId("opening-hours-sunday"));
      expect(sunday.getByText("Dimanche")).toBeOnTheScreen();
      expect(sunday.getByText("Fermé")).toBeOnTheScreen();
    });

    it("does not display the opening hours while the store is loading", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { queryByTestId } = await setup(neverResolves);

      expect(queryByTestId("opening-hours")).not.toBeOnTheScreen();
    });
  });

  describe("map", () => {
    it("centers the map on the store and adds a marker with its name", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByTestId } = await setup(fetchStoreById);

      expect(await findByTestId("store-map")).toBeOnTheScreen();
      expect(mockRenderMap).toHaveBeenLastCalledWith(
        expect.objectContaining({
          cameraPosition: expect.objectContaining({
            coordinates: store.location,
          }),
          markers: [{ coordinates: store.location, title: store.name }],
        }),
      );
    });

    it("does not render the map while the store is loading", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { queryByTestId } = await setup(neverResolves);

      expect(queryByTestId("store-map")).not.toBeOnTheScreen();
    });
  });

  describe("favorite button", () => {
    const FAVORI = { name: "Favori" };

    it("displays a Favori button once the store is fetched", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByRole } = await setup(fetchStoreById);

      expect(await findByRole("button", FAVORI)).toBeOnTheScreen();
    });

    it("does not display the Favori button while the store is loading", async () => {
      const neverResolves = jest.fn().mockReturnValue(new Promise(() => {}));

      const { queryByRole } = await setup(neverResolves);

      expect(queryByRole("button", FAVORI)).not.toBeOnTheScreen();
    });

    it("checks whether the store is a favorite", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { favorites } = await setup(fetchStoreById, { id: "1" });

      await waitFor(() =>
        expect(favorites.isFavorite).toHaveBeenCalledWith("1"),
      );
    });

    it("is not selected when the store is not a favorite", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByRole } = await setup(fetchStoreById);

      expect(await findByRole("button", FAVORI)).not.toBeSelected();
    });

    it("is selected when the store is already a favorite", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);
      const favorites = createFavoritesFake([store.id]);

      const { getByRole } = await setup(fetchStoreById, { favorites });

      await waitFor(() => expect(getByRole("button", FAVORI)).toBeSelected());
    });

    it("toggles the favorite of the store when pressed", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByRole, favorites } = await setup(fetchStoreById);
      fireEvent.press(await findByRole("button", FAVORI));

      await waitFor(() =>
        expect(favorites.toggleFavorite).toHaveBeenCalledWith(store.id),
      );
      expect(favorites.toggleFavorite).toHaveBeenCalledTimes(1);
    });

    it("becomes selected once the store has been added to the favorites", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);

      const { findByRole, getByRole } = await setup(fetchStoreById);
      fireEvent.press(await findByRole("button", FAVORI));

      await waitFor(() => expect(getByRole("button", FAVORI)).toBeSelected());
    });

    it("becomes unselected once the store has been removed from the favorites", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);
      const favorites = createFavoritesFake([store.id]);

      const { findByRole, getByRole } = await setup(fetchStoreById, {
        favorites,
      });
      await waitFor(() => expect(getByRole("button", FAVORI)).toBeSelected());
      fireEvent.press(await findByRole("button", FAVORI));

      await waitFor(() =>
        expect(getByRole("button", FAVORI)).not.toBeSelected(),
      );
    });

    it("stays unselected when toggling the favorite fails", async () => {
      const fetchStoreById = jest.fn().mockResolvedValue(store);
      const favorites = createFavoritesFake();
      favorites.toggleFavorite.mockRejectedValue(new Error("Storage down"));

      const { findByRole } = await setup(fetchStoreById, { favorites });
      fireEvent.press(await findByRole("button", FAVORI));

      await waitFor(() => expect(favorites.toggleFavorite).toHaveBeenCalled());
      expect(await findByRole("button", FAVORI)).not.toBeSelected();
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
