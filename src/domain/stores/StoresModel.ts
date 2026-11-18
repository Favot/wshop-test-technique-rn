export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export type TimeString = `${number}${number}:${number}${number}`;

export interface TimeRange {
  open: TimeString;
  close: TimeString;
}

export type OpeningHours = Readonly<Record<Weekday, readonly TimeRange[]>>;

export interface StoreCoordinates {
  latitude: number;
  longitude: number;
}

export type StoresModel = {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  openingHours: OpeningHours;
  location: StoreCoordinates;
};
