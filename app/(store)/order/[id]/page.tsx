"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrderRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/order/success?order_id=${params.id}`);
  }, [params.id, router]);

  return (
    <div className="w-full bg-cream min-h-[80vh] flex flex-col items-center py-16 px-6 justify-center">
      <Loader2 className="text-rose animate-spin mb-4" size={32} />
      <p className="text-dark font-medium">Redirecting you to order status...</p>
    </div>
  );
}
