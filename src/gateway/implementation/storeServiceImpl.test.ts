import AsyncStorage from "@react-native-async-storage/async-storage";

import { FAVORITES_STORAGE_KEY, storeService } from "./storeServiceImpl";

const BASE_URL = "http://localhost:3001";
const PAGINATION = "_page=1&_per_page=5";

const mockFetch = (data: unknown, { ok = true, status = 200 } = {}) => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue({ ok, status, json: async () => data });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const paginated = (data: unknown[] = [], next: number | null = null) => ({
  data,
  next,
});

describe("storeService (fetch implementation)", () => {
  it("fetchStores calls the /stores endpoint with the first page of 5 items", async () => {
    const fetchMock = mockFetch(paginated());

    await storeService.fetchStores();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/stores?${PAGINATION}`);
  });

  it("fetchStores requests the given page", async () => {
    const fetchMock = mockFetch(paginated());

    await storeService.fetchStores(undefined, 3);

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/stores?_page=3&_per_page=5`,
    );
  });

  it("fetchStores filters by name using the json-server `contains` operator", async () => {
    const fetchMock = mockFetch(paginated());

    await storeService.fetchStores("Paris");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/stores?name:contains=Paris&${PAGINATION}`,
    );
  });

  it("fetchStores url-encodes the name filter", async () => {
    const fetchMock = mockFetch(paginated());

    await storeService.fetchStores("Rép & Co");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/stores?name:contains=${encodeURIComponent("Rép & Co")}&${PAGINATION}`,
    );
  });

  it("fetchStores does not add a filter when the name is empty", async () => {
    const fetchMock = mockFetch(paginated());

    await storeService.fetchStores("");

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/stores?${PAGINATION}`);
  });

  it("fetchStores returns the stores of the page and the next page", async () => {
    const stores = [{ id: "1", name: "Store 1" }];
    mockFetch(paginated(stores, 2));

    await expect(storeService.fetchStores()).resolves.toEqual({
      stores,
      nextPage: 2,
    });
  });

  it("fetchStores returns a null nextPage on the last page", async () => {
    mockFetch(paginated([{ id: "1", name: "Store 1" }], null));

    await expect(storeService.fetchStores()).resolves.toMatchObject({
      nextPage: null,
    });
  });

  it("fetchStoreById calls /stores/:id and returns the store", async () => {
    const store = { id: "42", name: "Store 42" };
    const fetchMock = mockFetch(store);

    const result = await storeService.fetchStoreById("42");

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/stores/42`);
    expect(result).toEqual(store);
  });

  it("fetchStores throws when the response is not ok", async () => {
    mockFetch(null, { ok: false, status: 500 });

    await expect(storeService.fetchStores()).rejects.toThrow(
      `Request failed (500): ${BASE_URL}/stores?${PAGINATION}`,
    );
  });

  it("fetchStoreById throws when the response is not ok", async () => {
    mockFetch(null, { ok: false, status: 404 });

    await expect(storeService.fetchStoreById("42")).rejects.toThrow(
      `Request failed (404): ${BASE_URL}/stores/42`,
    );
  });

  it("propagates network errors", async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network down")) as unknown as typeof fetch;

    await expect(storeService.fetchStores()).rejects.toThrow("Network down");
  });
});

describe("storeService favorites (AsyncStorage implementation)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const storedFavorites = async () =>
    JSON.parse((await AsyncStorage.getItem(FAVORITES_STORAGE_KEY)) ?? "null");

  it("isFavorite returns false when nothing is stored", async () => {
    await expect(storeService.isFavorite("1")).resolves.toBe(false);
  });

  it("toggleFavorite adds a store that is not a favorite yet", async () => {
    await storeService.toggleFavorite("1");

    await expect(storeService.isFavorite("1")).resolves.toBe(true);
    expect(await storedFavorites()).toEqual(["1"]);
  });

  it("toggleFavorite removes a store that is already a favorite", async () => {
    await storeService.toggleFavorite("1");

    await storeService.toggleFavorite("1");

    await expect(storeService.isFavorite("1")).resolves.toBe(false);
    expect(await storedFavorites()).toEqual([]);
  });

  it("toggleFavorite keeps the other favorites untouched", async () => {
    await storeService.toggleFavorite("1");
    await storeService.toggleFavorite("2");

    await storeService.toggleFavorite("1");

    await expect(storeService.isFavorite("1")).resolves.toBe(false);
    await expect(storeService.isFavorite("2")).resolves.toBe(true);
    expect(await storedFavorites()).toEqual(["2"]);
  });

  it("isFavorite only returns true for the favorite stores", async () => {
    await storeService.toggleFavorite("1");

    await expect(storeService.isFavorite("1")).resolves.toBe(true);
    await expect(storeService.isFavorite("2")).resolves.toBe(false);
  });

  it("persists the favorites as a list of ids under the favorites key", async () => {
    await storeService.toggleFavorite("1");
    await storeService.toggleFavorite("2");

    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(["1", "2"]),
    );
  });

  it("isFavorite returns false when the stored value is not valid JSON", async () => {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, "not-json");

    await expect(storeService.isFavorite("1")).resolves.toBe(false);
  });

  it("isFavorite returns false when the stored value is not a list", async () => {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ a: 1 }));

    await expect(storeService.isFavorite("1")).resolves.toBe(false);
  });

  it("toggleFavorite recovers from a corrupted stored value", async () => {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, "not-json");

    await storeService.toggleFavorite("1");

    expect(await storedFavorites()).toEqual(["1"]);
  });

  it("propagates storage errors", async () => {
    jest
      .mocked(AsyncStorage.getItem)
      .mockRejectedValueOnce(new Error("Storage down"));

    await expect(storeService.isFavorite("1")).rejects.toThrow("Storage down");
  });
});
