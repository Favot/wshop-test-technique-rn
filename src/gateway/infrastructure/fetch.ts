import Constants from "expo-constants";
import { Platform } from "react-native";

const PORT = 3001;

const getHost = () => {
  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (metroHost) return metroHost;
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
};

export const BASE_URL = `http://${getHost()}:${PORT}`;

export type PaginatedResponse<T> = {
  data: T[];
  next: number | null;
};

type PaginatedQueryOptions = {
  filters?: string[];
  page: number;
  perPage: number;
};

export const buildPaginatedQuery = ({
  filters = [],
  page,
  perPage,
}: PaginatedQueryOptions): string =>
  [...filters, `_page=${page}`, `_per_page=${perPage}`].join("&");

export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return response.json();
};
