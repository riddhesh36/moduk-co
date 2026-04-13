"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    category: "Ordering & Delivery",
    questions: [
      { q: "Where do you deliver?", a: "We deliver across Mumbai and Navi Mumbai. If your pincode is outside our serviceable area, our checkout page will notify you." },
      { q: "Can I get same-day delivery?", a: "Yes! We offer same-day delivery based on slot availability. Please check the 'Today' slots on our product pages. Our slots close a few hours prior to the delivery window." },
      { q: "Do you offer Cash on Delivery (COD)?", a: "Yes, we accept both UPI (GPay, Paytm, PhonePe) and Cash on Delivery." },
    ]
  },
  {
    category: "Ingredients & Freshness",
    questions: [
      { q: "Are there any preservatives?", a: "Absolutely not. Our modaks are 100% natural, made with fresh coconut, jaggery, rice flour, and authentic garnishes like saffron and cardamom." },
      { q: "What is the shelf life?", a: "Ukadiche modaks are best consumed within 24 hours. Because they are made with fresh coconut, they should be refrigerated if you aren't eating them on the same day." },
      { q: "Are they gluten-free / vegan?", a: "They are naturally gluten-free as we use rice flour. However, we use pure desi ghee in the preparation, so they are not vegan." },
    ]
  },
  {
    category: "Gifting & Customisation",
    questions: [
      { q: "Can I add a personalized note for gifting?", a: "Yes! You can add an 'Order Note' during checkout, and we will include it with your box." },
      { q: "Do you take bulk or corporate orders?", a: "We do. For orders above 20 boxes, please reach out to us directly via WhatsApp through our Contact page." },
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string>("0-0");

  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-dark mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            Everything you need to know about our modaks, delivery, and ingredients.
          </p>
        </div>

        <div className="space-y-12">
          {FAQS.map((section, sIdx) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold font-playfair text-rose mb-6 pb-2 border-b border-rose/20">
                {section.category}
              </h2>
              <div className="flex flex-col gap-4">
                {section.questions.map((faq, qIdx) => {
                  const id = `${sIdx}-${qIdx}`;
                  const isOpen = openIndex === id;

                  return (
                    <div 
                      key={id} 
                      className={cn(
                        "bg-white border rounded-xl overflow-hidden transition-colors",
                        isOpen ? "border-rose shadow-sm" : "border-dark/5 hover:border-dark/20"
                      )}
                    >
                      <button 
                        className="w-full text-left p-5 flex justify-between items-center gap-4 focus:outline-none"
                        onClick={() => setOpenIndex(isOpen ? "" : id)}
                      >
                        <span className="font-semibold text-dark md:text-lg">{faq.q}</span>
                        <ChevronDown className={cn("shrink-0 text-text-muted transition-transform", isOpen && "rotate-180 text-rose")} />
                      </button>
                      <div 
                        className={cn(
                          "px-5 overflow-hidden transition-all duration-300 ease-in-out",
                          isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="text-text-body text-sm md:text-base leading-relaxed border-t border-dark/5 pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
