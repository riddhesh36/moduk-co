import { type ZoneResult } from "@/lib/deliveryZones";

export function ZoneStatusBadge({ result }: { result: ZoneResult }) {
  if (result.status === "unknown") return null;

  if (result.status === "out_of_zone") {
    return (
      <p className="text-sm text-red-500 mt-1 flex items-center gap-1.5 font-medium">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        Outside our delivery zone
      </p>
    );
  }

  return (
    <p className="text-sm text-[#B69141] mt-1 flex items-center gap-1.5 font-medium">
      <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
      We deliver here · ₹{result.fee} delivery fee
    </p>
  );
}
