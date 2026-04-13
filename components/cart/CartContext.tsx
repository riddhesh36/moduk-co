"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSlotId: string;
  selectedDate: string; // e.g., "19th April" or "today"
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(i => i.product.id === newItem.product.id);
      if (existing) {
        return prev.map(i => 
          i.product.id === newItem.product.id 
            ? { ...i, quantity: i.quantity + newItem.quantity, selectedSlotId: newItem.selectedSlotId } 
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
