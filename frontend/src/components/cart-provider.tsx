"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import { useAuth } from "@/components/auth-provider";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (shoeSlug: string, sizeLabel: string) => void;
  updateQuantity: (shoeSlug: string, sizeLabel: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "zephyr-cart";
const CART_EVENT = "zephyr-cart-updated";
const EMPTY_CART: CartItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    cachedRaw = null;
    cachedItems = EMPTY_CART;
    return cachedItems;
  }

  if (raw === cachedRaw) {
    return cachedItems;
  }

  try {
    cachedRaw = raw;
    cachedItems = JSON.parse(raw) as CartItem[];
    return cachedItems;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedItems = EMPTY_CART;
    return cachedItems;
  }
}

function writeCart(nextItems: CartItem[]) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(nextItems);
  cachedRaw = raw;
  cachedItems = nextItems;
  window.localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== STORAGE_KEY) return;
    onStoreChange();
  };

  const handleCustom = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_EVENT, handleCustom);
  };
}

function updateCart(updater: (current: CartItem[]) => CartItem[]) {
  const nextItems = updater(readCart());
  writeCart(nextItems);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isReady } = useAuth();
  const items = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
  const isAdminSession = isReady && isAdmin;
  const visibleItems = isAdminSession ? EMPTY_CART : items;

  const itemCount = visibleItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = visibleItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const value: CartContextValue = {
    items: visibleItems,
    itemCount,
    subtotal,
    addItem: (item, quantity = 1) => {
      if (isAdminSession) return;
      updateCart((current) => {
        const existing = current.find(
          (entry) => entry.shoeSlug === item.shoeSlug && entry.sizeLabel === item.sizeLabel,
        );

        if (existing) {
          return current.map((entry) =>
            entry.shoeSlug === item.shoeSlug && entry.sizeLabel === item.sizeLabel
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          );
        }

        return [...current, { ...item, quantity }];
      });
    },
    removeItem: (shoeSlug, sizeLabel) => {
      if (isAdminSession) return;
      updateCart((current) =>
        current.filter((item) => !(item.shoeSlug === shoeSlug && item.sizeLabel === sizeLabel)),
      );
    },
    updateQuantity: (shoeSlug, sizeLabel, quantity) => {
      if (isAdminSession) return;
      updateCart((current) =>
        current
          .map((item) =>
            item.shoeSlug === shoeSlug && item.sizeLabel === sizeLabel ? { ...item, quantity } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    clearCart: () => writeCart([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
