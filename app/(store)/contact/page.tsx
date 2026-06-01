import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="w-full bg-cream min-h-[80vh] py-16 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full text-center">

        <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-6">Reach Out</h1>
        <p className="text-lg md:text-xl text-text-muted mb-12">
          We&apos;re always here to assist you with bulk orders, customisations, or tracking your joy.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold font-playfair text-dark mb-3">WhatsApp Us</h2>
            <p className="text-text-muted mb-8 max-w-sm">
              The fastest way to reach our team. Available daily from 9:00 AM to 8:00 PM IST.
            </p>
            <a href="https://wa.me/918591781695" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-600/20">
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-dark/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-6">
              <InstagramIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold font-playfair text-dark mb-3">Follow our Journey</h2>
            <p className="text-text-muted mb-8 max-w-sm">
              See how our modaks are made and get behind-the-scenes glimpses of our kitchen.
            </p>
            <a href="https://instagram.com/modukandco" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button variant="secondary" size="lg" className="w-full text-pink-600 border-pink-200 hover:bg-pink-50">
                @modukandco
              </Button>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
