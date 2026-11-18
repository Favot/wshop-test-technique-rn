import { storeService } from "./storeServiceFetchImpl";

const BASE_URL = "http://localhost:3001";

const mockFetch = (data: unknown, { ok = true, status = 200 } = {}) => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue({ ok, status, json: async () => data });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

describe("storeService (fetch implementation)", () => {
  it("fetchStores calls the /stores endpoint", async () => {
    const fetchMock = mockFetch([]);

    await storeService.fetchStores();

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/stores`);
  });

  it("fetchStores filters by name using the json-server `contains` operator", async () => {
    const fetchMock = mockFetch([]);

    await storeService.fetchStores("Paris");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/stores?name:contains=Paris`,
    );
  });

  it("fetchStores url-encodes the name filter", async () => {
    const fetchMock = mockFetch([]);

    await storeService.fetchStores("Rép & Co");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/stores?name:contains=${encodeURIComponent("Rép & Co")}`,
    );
  });

  it("fetchStores does not add a filter when the name is empty", async () => {
    const fetchMock = mockFetch([]);

    await storeService.fetchStores("");

    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/stores`);
  });

  it("fetchStores returns the parsed stores", async () => {
    const stores = [{ id: "1", name: "Store 1" }];
    mockFetch(stores);

    await expect(storeService.fetchStores()).resolves.toEqual(stores);
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
      `Request failed (500): ${BASE_URL}/stores`,
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
