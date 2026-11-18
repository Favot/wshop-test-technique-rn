import type { StoresModel } from "@/domain/stores/StoresModel";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { StoreList } from "./StoreList";

const createStore = (index: number): StoresModel => ({
  id: String(index),
  name: `Store ${index}`,
  address: `${index} rue de Paris, 75001 Paris`,
  phone: `01 23 45 67 ${String(index).padStart(2, "0")}`,
  imageUrl: `https://example.com/stores/${index}.jpg`,
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
});

const stores = Array.from({ length: 3 }, (_, i) => createStore(i + 1));

describe("StoreList", () => {
  describe("display", () => {
    it("displays every store of the list", async () => {
      const { getByText } = await render(<StoreList stores={stores} />);

      stores.forEach((store) => {
        expect(getByText(store.name)).toBeOnTheScreen();
      });
    });

    it("displays the name, address, phone and image of a store", async () => {
      const [store] = stores;

      const { getByText, getByTestId } = await render(
        <StoreList stores={stores} />,
      );

      expect(getByText(store.name)).toBeOnTheScreen();
      expect(getByText(store.address)).toBeOnTheScreen();
      expect(getByText(store.phone)).toBeOnTheScreen();
      expect(getByTestId(`store-image-${store.id}`)).toBeOnTheScreen();
    });

    it("renders an empty list when stores are undefined", async () => {
      const { getByTestId, queryByText } = await render(
        <StoreList stores={undefined} />,
      );

      expect(getByTestId("store-list")).toBeOnTheScreen();
      expect(queryByText(/Store/)).not.toBeOnTheScreen();
    });
  });

  describe("empty state", () => {
    it("displays the given empty component when there is no store", async () => {
      const { getByText } = await render(
        <StoreList
          stores={[]}
          ListEmptyComponent={<Text>Nothing here</Text>}
        />,
      );

      expect(getByText("Nothing here")).toBeOnTheScreen();
    });

    it("does not display the empty component when there are stores", async () => {
      const { queryByText } = await render(
        <StoreList
          stores={stores}
          ListEmptyComponent={<Text>Nothing here</Text>}
        />,
      );

      expect(queryByText("Nothing here")).not.toBeOnTheScreen();
    });
  });

  describe("pull to refresh", () => {
    it("calls onRefresh when the list is pulled down", async () => {
      const onRefresh = jest.fn();

      const { getByTestId } = await render(
        <StoreList stores={stores} onRefresh={onRefresh} />,
      );
      await act(async () => {
        fireEvent(getByTestId("store-list"), "refresh");
      });

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("reflects the refreshing state on the list", async () => {
      const { getByTestId } = await render(
        <StoreList stores={stores} onRefresh={jest.fn()} isRefreshing />,
      );

      expect(
        getByTestId("store-list").props.refreshControl.props.refreshing,
      ).toBe(true);
    });
  });

  describe("infinite scroll", () => {
    it("calls onEndReached when the end of the list is reached", async () => {
      const onEndReached = jest.fn();

      const { getByTestId } = await render(
        <StoreList stores={stores} onEndReached={onEndReached} />,
      );
      await act(async () => {
        fireEvent(getByTestId("store-list"), "endReached");
      });

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });

    it("shows a loader at the bottom while the next page is fetching", async () => {
      const { getByTestId } = await render(
        <StoreList stores={stores} isFetchingNextPage />,
      );

      expect(getByTestId("next-page-loader")).toBeOnTheScreen();
    });

    it("hides the bottom loader when no page is being fetched", async () => {
      const { queryByTestId } = await render(<StoreList stores={stores} />);

      expect(queryByTestId("next-page-loader")).not.toBeOnTheScreen();
    });
  });
});
