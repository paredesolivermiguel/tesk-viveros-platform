import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  productId: number;
  name: string;
  unitsPerTray: number;
  trayEnabled: boolean;
  price: number;
  units: number;
  trays: number;
}

interface CartState {
  items: CartItem[];
  addOrUpdate: (item: CartItem) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addOrUpdate(item: CartItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      if (!exists) return [...prev, item];
      return prev.map((i) => (i.productId === item.productId ? item : i));
    });
  }

  function remove(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  return <CartContext.Provider value={{ items, addOrUpdate, remove, clear }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
