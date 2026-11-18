import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addItem,
  clearCart,
  persistConfig,
  persistor,
  removeItem,
  selectCartTotal,
  store,
  updateQuantity,
} from "./CardStoreRedux";

const apple = { id: "apple", name: "Apple", price: 2 };
const pear = { id: "pear", name: "Pear", price: 3 };

const getItems = () => store.getState().items;
const storageKey = `persist:${persistConfig.key}`;

beforeEach(async () => {
  store.dispatch(clearCart());
  await persistor.purge();
});

describe("CardStoreRedux", () => {
  describe("items", () => {
    it("adds an item with quantity 1", () => {
      store.dispatch(addItem(apple));

      expect(getItems()).toEqual([{ ...apple, quantity: 1 }]);
    });

    it("increments quantity when the same item is added again", () => {
      store.dispatch(addItem(apple));
      store.dispatch(addItem(apple));

      expect(getItems()).toEqual([{ ...apple, quantity: 2 }]);
    });

    it("removes an item", () => {
      store.dispatch(addItem(apple));
      store.dispatch(addItem(pear));

      store.dispatch(removeItem(apple.id));

      expect(getItems()).toEqual([{ ...pear, quantity: 1 }]);
    });

    it("updates an item quantity", () => {
      store.dispatch(addItem(apple));

      store.dispatch(updateQuantity({ id: apple.id, quantity: 5 }));

      expect(getItems()[0].quantity).toBe(5);
    });

    it("removes the item when quantity is updated to 0", () => {
      store.dispatch(addItem(apple));

      store.dispatch(updateQuantity({ id: apple.id, quantity: 0 }));

      expect(getItems()).toEqual([]);
    });
  });

  describe("selectCartTotal", () => {
    it("returns 0 for an empty cart", () => {
      expect(selectCartTotal(store.getState())).toBe(0);
    });

    it("sums price * quantity of all items", () => {
      store.dispatch(addItem(apple));
      store.dispatch(addItem(pear));
      store.dispatch(updateQuantity({ id: apple.id, quantity: 3 }));

      expect(selectCartTotal(store.getState())).toBe(3 * 2 + 3);
    });

    describe("memoization", () => {
      beforeEach(() => selectCartTotal.resetRecomputations());

      it("does not recompute when items are unchanged", () => {
        store.dispatch(addItem(apple));
        const state = store.getState();

        selectCartTotal(state);
        selectCartTotal(state);

        selectCartTotal({ ...state });

        expect(selectCartTotal.recomputations()).toBe(1);
      });

      it("recomputes when items change", () => {
        store.dispatch(addItem(apple));
        selectCartTotal(store.getState());

        store.dispatch(addItem(pear));
        selectCartTotal(store.getState());

        expect(selectCartTotal.recomputations()).toBe(2);
      });
    });
  });

  describe("persistence", () => {
    it("writes the items to storage", async () => {
      store.dispatch(addItem(apple));
      await persistor.flush();

      const stored = await AsyncStorage.getItem(storageKey);
      const state = JSON.parse(stored as string) as { items: string };

      expect(JSON.parse(state.items)).toEqual([{ ...apple, quantity: 1 }]);
    });

    it("rehydrates the items from storage", async () => {
      // Simulate an app restart: storage has a cart, a fresh store boots.
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          items: JSON.stringify([{ ...apple, quantity: 1 }]),
        }),
      );

      let fresh!: typeof import("./CardStoreRedux");
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        fresh = require("./CardStoreRedux");
      });
      expect(fresh.store.getState().items).toEqual([]);

      await new Promise<void>((resolve) => {
        const unsubscribe = fresh.persistor.subscribe(() => {
          if (fresh.persistor.getState().bootstrapped) {
            unsubscribe();
            resolve();
          }
        });
      });

      expect(fresh.store.getState().items).toEqual([{ ...apple, quantity: 1 }]);
    });
  });
});
