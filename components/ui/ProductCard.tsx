import Image from "next/image";
import Link from "next/link";
import { type Product } from "@/types";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  slotsAvailable: boolean;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, slotsAvailable, onAddToCart }: ProductCardProps) {
  return (
    <div className="w-full flex flex-col rounded-[12px] bg-white overflow-hidden group" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      {/* Image Container */}
      <Link href={`/shop/${product.slug}`} className="relative w-full aspect-[4/3] bg-blush overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges Container */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {product.badge && (
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest bg-dark text-white shadow-md">
              {product.badge}
            </span>
          )}
          {/* Availability Badge */}
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${slotsAvailable ? "bg-white text-rose shadow-sm" : "bg-[#E0E0E0] text-[#777777]"}`}>
            {slotsAvailable ? "Slots Open" : "Full"}
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link href={`/shop/${product.slug}`} className="hover:text-rose transition-colors">
          <h3 className="text-lg md:text-[22px] font-semibold text-dark line-clamp-1">{product.name}</h3>
          <p className="text-[13px] text-text-muted mt-1 leading-snug line-clamp-2">{product.description}</p>
        </Link>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[20px] font-bold text-rose">₹{product.price}</span>
            <span className="text-[13px] text-text-muted">{product.price_label.split("·")[1]?.trim() || "per box"}</span>
          </div>

          <Button 
            className="w-full" 
            disabled={!slotsAvailable}
            onClick={() => onAddToCart(product)}
          >
            {slotsAvailable ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
