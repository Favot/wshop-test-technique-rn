import AsyncStorage from "@react-native-async-storage/async-storage";

export const readStringList = async (key: string): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

export const hasStringListItem = async (
  key: string,
  value: string,
): Promise<boolean> => (await readStringList(key)).includes(value);

export const toggleStringListItem = async (
  key: string,
  value: string,
): Promise<void> => {
  const list = await readStringList(key);
  const next = list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
  await AsyncStorage.setItem(key, JSON.stringify(next));
};
