"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="bg-[#FDF8F0] min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#333333] font-dmsans relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#2C1A1D] text-white px-6 py-4 fixed top-0 left-0 right-0 z-40 shadow-md h-16">
        <div>
          <h1 className="text-lg font-playfair font-bold text-[#C4617A]">Admin Panel</h1>
          <p className="text-[8px] text-white/50 uppercase tracking-widest">Moduk & Co.</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="pl-0 md:pl-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 md:p-10">
          <div className="bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] rounded-2xl md:rounded-3xl border border-[#FDF0F3] min-h-full p-6 sm:p-8 md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
