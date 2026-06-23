import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { DeliveryAdvisoryModal } from "@/components/ui/DeliveryAdvisoryModal";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 flex flex-col w-full h-full relative">
        {children}
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
      <DeliveryAdvisoryModal />
    </CartProvider>
  );
}
