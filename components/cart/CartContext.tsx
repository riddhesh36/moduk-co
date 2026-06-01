"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";
import { Toast } from "@/components/ui/Toast";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSlotId: string;
  selectedDate: string; // e.g., "19th April" or "today"
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, slotId: string, selectedDate: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Load cart items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("moduk_cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart items from localStorage:", e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save cart items to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("moduk_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        i => i.product.id === newItem.product.id && 
             i.selectedSlotId === newItem.selectedSlotId && 
             i.selectedDate === newItem.selectedDate
      );
      if (existing) {
        return prev.map(i => 
          i.product.id === newItem.product.id && 
          i.selectedSlotId === newItem.selectedSlotId && 
          i.selectedDate === newItem.selectedDate
            ? { ...i, quantity: i.quantity + newItem.quantity } 
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string, slotId: string, selectedDate: string) => {
    setItems((prev) => prev.filter(i => !(i.product.id === productId && i.selectedSlotId === slotId && i.selectedDate === selectedDate)));
  };

  const clearCart = () => setItems([]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice, showToast }}>
      {children}
      <Toast 
        message={toastMessage} 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

