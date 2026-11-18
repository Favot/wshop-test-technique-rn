export type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useFetch = <T>(
  _url: string,
  _options?: RequestInit,
): UseFetchResult<T> => {
  throw new Error("Not implemented");
};
