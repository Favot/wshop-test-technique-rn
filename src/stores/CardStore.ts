import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = CartProduct & { quantity: number };

type CartState = {
  items: CartItem[];
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (_set, _get): CartState => ({
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
    }),
    {
      name: "cart",
    },
  ),
);

export const selectCartTotal = (_state: CartState): number => {
  return NaN;
};
