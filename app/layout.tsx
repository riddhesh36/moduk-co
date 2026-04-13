import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moduk & Co — Premium Homemade Modak Delivery in Mumbai | Same-Day Slots",
  description: "Pure Joy. Made at Home. Delivered to Yours. Premium homemade modak delivery in Mumbai & Navi Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} font-dmsans antialiased text-text-body bg-cream min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
