"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

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

const GUEST_STORAGE_KEY = "zephyr-cart:guest";
const USER_STORAGE_KEY_PREFIX = "zephyr-cart:user:";
const CART_EVENT = "zephyr-cart-updated";
const EMPTY_CART: CartItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;

function getUserStorageKey(userId: number) {
  return `${USER_STORAGE_KEY_PREFIX}${userId}`;
}

function readCart(storageKey: string): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  const raw = window.localStorage.getItem(storageKey);
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
    window.localStorage.removeItem(storageKey);
    cachedRaw = null;
    cachedItems = EMPTY_CART;
    return cachedItems;
  }
}

function dispatchCartEvent(storageKey: string) {
  window.dispatchEvent(
    new CustomEvent(CART_EVENT, {
      detail: { storageKey },
    }),
  );
}

function writeCart(storageKey: string, nextItems: CartItem[]) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(nextItems);
  cachedRaw = raw;
  cachedItems = nextItems;
  window.localStorage.setItem(storageKey, raw);
  dispatchCartEvent(storageKey);
}

function clearCartStorage(storageKey: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(storageKey);
  cachedRaw = null;
  cachedItems = EMPTY_CART;
  dispatchCartEvent(storageKey);
}

function subscribe(storageKey: string, onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== storageKey) return;
    onStoreChange();
  };

  const handleCustom = (event: Event) => {
    if (
      event instanceof CustomEvent &&
      event.detail &&
      typeof event.detail === "object" &&
      "storageKey" in event.detail &&
      event.detail.storageKey !== storageKey
    ) {
      return;
    }
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_EVENT, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_EVENT, handleCustom);
  };
}

function mergeCartItems(currentItems: CartItem[], incomingItems: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of currentItems) {
    merged.set(`${item.shoeSlug}::${item.sizeLabel}`, item);
  }

  for (const item of incomingItems) {
    const key = `${item.shoeSlug}::${item.sizeLabel}`;
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, { ...existing, quantity: existing.quantity + item.quantity });
      continue;
    }
    merged.set(key, item);
  }

  return Array.from(merged.values());
}

function updateCart(storageKey: string, updater: (current: CartItem[]) => CartItem[]) {
  const nextItems = updater(readCart(storageKey));
  writeCart(storageKey, nextItems);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin, isAuthenticated, isReady, user } = useAuth();
  const isAdminSession = isReady && isAdmin;
  const storageKey = useMemo(() => {
    if (isAdminSession) {
      return null;
    }

    if (isAuthenticated && user) {
      return getUserStorageKey(user.id);
    }

    return GUEST_STORAGE_KEY;
  }, [isAdminSession, isAuthenticated, user]);

  const items = useSyncExternalStore(
    (onStoreChange) => (storageKey ? subscribe(storageKey, onStoreChange) : () => undefined),
    () => (storageKey ? readCart(storageKey) : EMPTY_CART),
    () => EMPTY_CART,
  );
  const visibleItems = isAdminSession ? EMPTY_CART : items;

  useEffect(() => {
    if (!isReady || isAdminSession || !isAuthenticated || !user || !storageKey) {
      return;
    }

    const guestItems = readCart(GUEST_STORAGE_KEY);
    if (storageKey === GUEST_STORAGE_KEY || guestItems.length === 0) {
      return;
    }

    const mergedItems = mergeCartItems(readCart(storageKey), guestItems);
    writeCart(storageKey, mergedItems);
    clearCartStorage(GUEST_STORAGE_KEY);
  }, [isAdminSession, isAuthenticated, isReady, storageKey, user]);

  const itemCount = visibleItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = visibleItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const value: CartContextValue = {
    items: visibleItems,
    itemCount,
    subtotal,
    addItem: (item, quantity = 1) => {
      if (isAdminSession || !storageKey) return;
      updateCart(storageKey, (current) => {
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
      if (isAdminSession || !storageKey) return;
      updateCart(storageKey, (current) =>
        current.filter((item) => !(item.shoeSlug === shoeSlug && item.sizeLabel === sizeLabel)),
      );
    },
    updateQuantity: (shoeSlug, sizeLabel, quantity) => {
      if (isAdminSession || !storageKey) return;
      updateCart(storageKey, (current) =>
        current
          .map((item) =>
            item.shoeSlug === shoeSlug && item.sizeLabel === sizeLabel ? { ...item, quantity } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    clearCart: () => {
      if (!storageKey) return;
      writeCart(storageKey, []);
    },
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
