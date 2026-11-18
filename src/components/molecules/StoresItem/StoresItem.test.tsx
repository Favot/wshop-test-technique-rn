import type { StoresModel } from "@/domain/stores/StoresModel";
import { render } from "@testing-library/react-native";

import { StoresItem } from "./StoresItem";

const store: StoresModel = {
  id: "1",
  name: "Store 1",
  address: "1 rue de Paris, 75001 Paris",
  phone: "01 23 45 67 01",
  imageUrl: "https://example.com/stores/1.jpg",
  openingHours: {
    monday: [{ open: "09:00", close: "18:00" }],
    tuesday: [{ open: "09:00", close: "18:00" }],
    wednesday: [{ open: "09:00", close: "18:00" }],
    thursday: [{ open: "09:00", close: "18:00" }],
    friday: [{ open: "09:00", close: "18:00" }],
    saturday: [{ open: "10:00", close: "17:00" }],
    sunday: [],
  },
  location: { latitude: 48.8566, longitude: 2.3522 },
};

describe("StoresItem", () => {
  it("displays the store name", async () => {
    const { getByText } = await render(<StoresItem store={store} />);

    expect(getByText(store.name)).toBeOnTheScreen();
  });

  it("displays the store address", async () => {
    const { getByText } = await render(<StoresItem store={store} />);

    expect(getByText(store.address)).toBeOnTheScreen();
  });

  it("displays the store phone", async () => {
    const { getByText } = await render(<StoresItem store={store} />);

    expect(getByText(store.phone)).toBeOnTheScreen();
  });

  it("displays the store image", async () => {
    const { getByTestId } = await render(<StoresItem store={store} />);

    expect(getByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
  });
});
