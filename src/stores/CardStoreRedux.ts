import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = CartProduct & { quantity: number };

type CartState = {
  items: CartItem[];
};

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, { payload }: PayloadAction<CartProduct>) => {
      const existing = state.items.find((item) => item.id === payload.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...payload, quantity: 1 });
      }
    },
    removeItem: (state, { payload: id }: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== id);
    },
    updateQuantity: (
      state,
      { payload }: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      state.items =
        payload.quantity <= 0
          ? state.items.filter((item) => item.id !== payload.id)
          : state.items.map((item) =>
              item.id === payload.id
                ? { ...item, quantity: payload.quantity }
                : item,
            );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } =
  cartSlice.actions;

export const persistConfig = {
  key: "cart",
  storage: AsyncStorage,
  whitelist: ["items"],
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, cartSlice.reducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const selectCartTotal = createSelector(
  [(state: Pick<CartState, "items">) => state.items],
  (items) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0),
);
