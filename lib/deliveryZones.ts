export type ZoneResult =
  | { status: "serviceable"; zone: 1 | 2; fee: number; label: string }
  | { status: "out_of_zone" }
  | { status: "unknown" };

const ZONE_MAP: Record<string, { zone: 1 | 2; fee: number; label: string }> = {
  // ── Zone 1 — ₹100 delivery (within ~4 km of Lalbaug) ──
  "400012": { zone: 1, fee: 100, label: "Parel / Lalbaug" },
  "400013": { zone: 1, fee: 100, label: "Dadar West" },
  "400014": { zone: 1, fee: 100, label: "Dadar East / Matunga West" },
  "400016": { zone: 1, fee: 100, label: "Mahim" },
  "400017": { zone: 1, fee: 100, label: "Dharavi / Sion West" },
  "400022": { zone: 1, fee: 100, label: "Sion" },
  "400010": { zone: 1, fee: 100, label: "Mazgaon / Byculla" },
  "400011": { zone: 1, fee: 100, label: "Byculla East" },
  "400033": { zone: 1, fee: 100, label: "Matunga East" },

  // ── Zone 2 — ₹100 delivery (4–7 km, still reachable) ──
  "400025": { zone: 2, fee: 100, label: "Worli" },
  "400018": { zone: 2, fee: 100, label: "Prabhadevi" },
  "400028": { zone: 2, fee: 100, label: "Vile Parle West" },
  "400024": { zone: 2, fee: 100, label: "Wadala" },
  "400037": { zone: 2, fee: 100, label: "Chembur West" },
  "400071": { zone: 2, fee: 100, label: "Chembur East" },
  "400055": { zone: 2, fee: 100, label: "Santacruz West" },
  "400054": { zone: 2, fee: 100, label: "Santacruz East" },
  "400029": { zone: 2, fee: 100, label: "Vile Parle East" },
  "400059": { zone: 2, fee: 100, label: "Andheri West" },
  "400069": { zone: 2, fee: 100, label: "Andheri East" },
};

export function checkDeliveryZone(pincode: string): ZoneResult {
  const clean = pincode.trim();
  if (clean.length !== 6 || !/^\d{6}$/.test(clean)) return { status: "unknown" };
  const match = ZONE_MAP[clean];
  if (!match) return { status: "out_of_zone" };
  return { status: "serviceable", ...match };
}

export const KITCHEN_ADDRESS =
  "Moduk & Co Kitchen, Lalbaug, Mumbai — 400012";
export const BORZO_LINK = "https://borzo.com"; // update if you have a referral link
