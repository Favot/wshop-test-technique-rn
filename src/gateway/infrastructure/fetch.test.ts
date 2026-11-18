import { BASE_URL, buildPaginatedQuery, fetchJson } from "./fetch";

const mockFetch = (data: unknown, { ok = true, status = 200 } = {}) => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue({ ok, status, json: async () => data });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

describe("BASE_URL", () => {
  it("targets the json-server on port 3001", () => {
    expect(BASE_URL).toBe("http://localhost:3001");
  });
});

describe("buildPaginatedQuery", () => {
  it("builds the page and per page parameters", () => {
    expect(buildPaginatedQuery({ page: 2, perPage: 5 })).toBe(
      "_page=2&_per_page=5",
    );
  });

  it("puts the filters before the pagination parameters", () => {
    expect(
      buildPaginatedQuery({
        filters: ["name:contains=Paris", "city=Lyon"],
        page: 1,
        perPage: 10,
      }),
    ).toBe("name:contains=Paris&city=Lyon&_page=1&_per_page=10");
  });

  it("ignores an empty list of filters", () => {
    expect(buildPaginatedQuery({ filters: [], page: 1, perPage: 5 })).toBe(
      "_page=1&_per_page=5",
    );
  });
});

describe("fetchJson", () => {
  it("calls the given url and returns the parsed body", async () => {
    const fetchMock = mockFetch({ id: "1" });

    await expect(fetchJson("http://example.com/a")).resolves.toEqual({
      id: "1",
    });
    expect(fetchMock).toHaveBeenCalledWith("http://example.com/a");
  });

  it("throws with the status and url when the response is not ok", async () => {
    mockFetch(null, { ok: false, status: 404 });

    await expect(fetchJson("http://example.com/a")).rejects.toThrow(
      "Request failed (404): http://example.com/a",
    );
  });

  it("propagates network errors", async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error("Network down")) as unknown as typeof fetch;

    await expect(fetchJson("http://example.com/a")).rejects.toThrow(
      "Network down",
    );
  });
});
