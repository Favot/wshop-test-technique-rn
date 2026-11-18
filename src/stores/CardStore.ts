import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
    (set): CartState => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);

          return {
            items: exists
              ? state.items.map((item) =>
                  item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
                )
              : [...state.items, { ...product, quantity: 1 }],
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, quantity } : item,
                ),
        }));
      },
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ items }) => ({ items }),
    },
  ),
);

export const selectCartTotal = (_state: CartState): number => {
  return NaN;
};
