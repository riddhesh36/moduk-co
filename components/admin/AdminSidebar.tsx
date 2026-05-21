"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Package, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard,
  LogOut,
  X,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Delivery Slots", href: "/admin/slots", icon: Calendar },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const prevPathnameVal = useRef(pathname);

  // Close the sidebar when navigation happens (specifically on mobile)
  useEffect(() => {
    if (prevPathnameVal.current !== pathname) {
      onClose();
      prevPathnameVal.current = pathname;
    }
  }, [pathname, onClose]);

  return (
    <div 
      className={cn(
        "w-64 bg-[#2C1A1D] text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-[#C4617A]">Admin Panel</h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Moduk & Co. CMS</p>
        </div>
        <button 
          onClick={onClose} 
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          aria-label="Close Sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-[#C4617A] text-white shadow-lg shadow-[#C4617A]/20" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-[#C4617A]")} />
              <span className="font-semibold">{item.name}</span>
              {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={20} />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
