import Link from "next/link";
import { WhatsAppButton } from "../ui/WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-dark text-cream mt-auto border-t border-dark/90">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <h2 className="font-playfair text-[24px] font-bold">MODUK & CO</h2>
            <p className="text-[14px] text-cream/70 leading-relaxed max-w-[280px]">
              Pure Joy. Delivered to Your Door. Premium homemade modak delivery in Mumbai & Navi Mumbai.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-between md:col-span-2">
            <div className="flex flex-col gap-3">
              <h3 className="font-dmsans text-[13px] font-semibold tracking-widest text-cream/50 uppercase">Shop</h3>
              <Link href="/shop" className="text-[15px] hover:text-rose transition-colors">Our Modaks</Link>
              <Link href="/delivery" className="text-[15px] hover:text-rose transition-colors">Delivery Info</Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h3 className="font-dmsans text-[13px] font-semibold tracking-widest text-cream/50 uppercase">Company</h3>
              <Link href="/about" className="text-[15px] hover:text-rose transition-colors">Our Story</Link>
              <Link href="/faq" className="text-[15px] hover:text-rose transition-colors">FAQs</Link>
              <WhatsAppButton variant="link" className="text-[15px]" />
            </div>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-cream/50">
          <p>© {new Date().getFullYear()} Moduk & Co. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-rose transition-colors">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
