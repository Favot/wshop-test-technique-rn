import { selectCartTotal, useCartStore } from "./CardStore";

const apple = { id: "apple", name: "Apple", price: 2 };
const pear = { id: "pear", name: "Pear", price: 3 };

const { addItem, removeItem, updateQuantity } = useCartStore.getState();
const getItems = () => useCartStore.getState().items;

beforeEach(() => {
  useCartStore.setState({ items: [] });
  useCartStore.persist.clearStorage();
});

describe("CardStore", () => {
  describe("items", () => {
    it("adds an item with quantity 1", () => {
      addItem(apple);

      expect(getItems()).toEqual([{ ...apple, quantity: 1 }]);
    });

    it("increments quantity when the same item is added again", () => {
      addItem(apple);
      addItem(apple);

      expect(getItems()).toEqual([{ ...apple, quantity: 2 }]);
    });

    it("removes an item", () => {
      addItem(apple);
      addItem(pear);

      removeItem(apple.id);

      expect(getItems()).toEqual([{ ...pear, quantity: 1 }]);
    });

    it("updates an item quantity", () => {
      addItem(apple);

      updateQuantity(apple.id, 5);

      expect(getItems()[0].quantity).toBe(5);
    });

    it("removes the item when quantity is updated to 0", () => {
      addItem(apple);

      updateQuantity(apple.id, 0);

      expect(getItems()).toEqual([]);
    });
  });

  describe("selectCartTotal", () => {
    it("returns 0 for an empty cart", () => {
      expect(selectCartTotal(useCartStore.getState())).toBe(0);
    });

    it("sums price * quantity of all items", () => {
      addItem(apple);
      addItem(pear);
      updateQuantity(apple.id, 3);

      expect(selectCartTotal(useCartStore.getState())).toBe(3 * 2 + 3);
    });
  });

  describe("persistence", () => {
    it("writes the items to storage", async () => {
      addItem(apple);

      const { name, storage } = useCartStore.persist.getOptions();
      const stored = await storage?.getItem(name as string);
      const state = stored?.state as { items: unknown[] } | undefined;

      expect(state?.items).toEqual([{ ...apple, quantity: 1 }]);
    });

    it("rehydrates the items from storage", async () => {
      addItem(apple);

      useCartStore.setState({ items: [] });
      expect(getItems()).toEqual([]);

      await useCartStore.persist.rehydrate();

      expect(getItems()).toEqual([{ ...apple, quantity: 1 }]);
    });
  });
});
