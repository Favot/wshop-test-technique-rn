import { storeService } from "./storeServiceImpl";

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
