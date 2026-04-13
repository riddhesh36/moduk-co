import Link from "next/link";
import { LayoutDashboard, CalendarDays, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In a real application, you would wrap this with Supabase Auth checks
  // and redirect to login if session is null.

  return (
    <div className="flex h-screen bg-[#FDF8F0] text-[#333333] font-dmsans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C1A1D] text-[#FDF8F0] flex flex-col p-6 h-full">
        <Link href="/admin" className="font-playfair font-bold text-2xl tracking-wide mb-12">
          MODUK Admin
        </Link>
        <nav className="flex-1 space-y-4">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} /> Order Inbox
          </Link>
          <Link href="/admin/slots" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <CalendarDays size={20} /> Slot Management
          </Link>
        </nav>
        <button className="flex items-center gap-3 px-4 py-3 text-[#E8A0B0] hover:bg-white/5 rounded-lg transition-colors mt-auto">
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] mx-6 my-6 rounded-3xl border border-[#FDF0F3]">
        {children}
      </main>
    </div>
  );
}
