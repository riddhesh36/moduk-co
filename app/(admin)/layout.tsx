import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FDF8F0] text-[#333333] font-dmsans">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pl-64">
        <div className="p-10">
           <div className="bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] rounded-3xl border border-[#FDF0F3] min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
