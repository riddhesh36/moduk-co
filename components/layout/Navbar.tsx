"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  // Simplified link list
  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Delivery", href: "/delivery" },
    { label: "FAQs", href: "/faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark text-cream font-dmsans">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-playfair text-[20px] md:text-[24px] font-bold tracking-wide">
            MODUK & CO
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[15px]">
            {navLinks.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="hover:text-rose transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cart" className="flex items-center gap-2 hover:text-rose transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-2 bg-rose text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/cart" className="relative p-2">
              <ShoppingBag className="w-5 h-5 text-cream" />
              {totalItems > 0 && <span className="absolute top-1 right-1 bg-rose text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalItems}</span>}
            </Link>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-dark border-t border-cream/10 px-4 py-4 space-y-4 shadow-xl">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-[16px] py-2 border-b border-cream/5 text-cream hover:text-rose transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block text-[16px] py-2 text-rose font-semibold"
            onClick={() => setIsOpen(false)}
          >
            Contact on WhatsApp
          </Link>
        </div>
      )}
    </nav>
  );
}
