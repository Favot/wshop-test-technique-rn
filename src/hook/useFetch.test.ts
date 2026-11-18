import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useFetch } from "./useFetch";

type User = { id: number; name: string };

const USERS: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Linus" },
];

const jsonResponse = <T>(body: T): Response =>
  ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

const pendingFetch = (_url: unknown, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted.", "AbortError")),
    );
  });

describe("useFetch", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("accepts a URL and optional fetch options", () => {
    it("calls fetch with the URL and the given options, plus an abort signal", async () => {
      fetchMock.mockResolvedValue(jsonResponse(USERS));
      const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      await renderHook(() => useFetch<User[]>("/api/users", options));

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/users");
      expect(init).toMatchObject(options);
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe("exposes data, loading and error", () => {
    it("exposes data once the request succeeds", async () => {
      fetchMock.mockResolvedValue(jsonResponse(USERS));

      const { result } = await renderHook(() => useFetch<User[]>("/api/users"));

      expect(result.current.data).toBeNull();
      await waitFor(() => expect(result.current.data).toEqual(USERS));
    });

    it("exposes loading as true while pending and false once settled", async () => {
      fetchMock.mockResolvedValue(jsonResponse(USERS));

      const { result } = await renderHook(() => useFetch<User[]>("/api/users"));

      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it("exposes error when the request fails", async () => {
      fetchMock.mockRejectedValue(new Error("Network down"));

      const { result } = await renderHook(() => useFetch<User[]>("/api/users"));

      expect(result.current.error).toBeNull();
      await waitFor(() =>
        expect(result.current.error?.message).toBe("Network down"),
      );
    });
  });

  describe("aborts the request when the component unmounts", () => {
    it("aborts the in-flight request on unmount", async () => {
      fetchMock.mockImplementation(pendingFetch);
      const { unmount } = await renderHook(() =>
        useFetch<User[]>("/api/users"),
      );
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      const signal: AbortSignal = fetchMock.mock.calls[0][1].signal;
      expect(signal.aborted).toBe(false);

      await unmount();

      expect(signal.aborted).toBe(true);
    });
  });

  describe("handles refetch through an exposed function", () => {
    it("triggers a new request and updates data when refetch is called", async () => {
      const updated: User[] = [{ id: 3, name: "Grace" }];
      fetchMock
        .mockResolvedValueOnce(jsonResponse(USERS))
        .mockResolvedValueOnce(jsonResponse(updated));
      const { result } = await renderHook(() => useFetch<User[]>("/api/users"));
      await waitFor(() => expect(result.current.data).toEqual(USERS));

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => expect(result.current.data).toEqual(updated));
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("is correctly typed with a generic", () => {
    it("types data as T | null", async () => {
      fetchMock.mockResolvedValue(jsonResponse(USERS));
      const { result } = await renderHook(() => useFetch<User[]>("/api/users"));
      await waitFor(() => expect(result.current.loading).toBe(false));

      const data: User[] | null = result.current.data;
      // @ts-expect-error data is User[] | null, not a string
      const wrong: string | null = result.current.data;

      expect(data).toEqual(USERS);
      expect(wrong).toEqual(USERS);
    });
  });
});
