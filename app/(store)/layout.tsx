import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1 flex flex-col w-full h-full relative pt-16">
        {children}
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </CartProvider>
  );
}
