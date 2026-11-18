import { useCallback, useEffect, useRef, useState } from "react";

export type UseFetchResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

type State<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

const isAbortError = (value: unknown): boolean =>
  value instanceof Error && value.name === "AbortError";

export const useFetch = <T>(
  url: string,
  options?: RequestInit,
): UseFetchResult<T> => {
  const [state, setState] = useState<State<T>>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [trigger, setTrigger] = useState(0);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    const run = async () => {
      try {
        const response = await fetch(url, {
          ...optionsRef.current,
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as T;
        if (!controller.signal.aborted) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (caught) {
        if (controller.signal.aborted || isAbortError(caught)) {
          return;
        }
        setState((previous) => ({
          ...previous,
          isLoading: false,
          error: toError(caught),
        }));
      }
    };

    void run();

    return () => controller.abort();
  }, [url, trigger]);

  const refetch = useCallback(() => setTrigger((count) => count + 1), []);

  return { ...state, refetch };
};
