"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, MapPin } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-blush px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-dark">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Sparkles, title: "1. Choose Your Box", desc: "Select our classic or kesar infused modaks for your occasion." },
            { icon: Clock, title: "2. Pick a Slot", desc: "Choose a delivery window for today or tomorrow." },
            { icon: MapPin, title: "3. Delivered Fresh", desc: "Hand-delivered fresh to your doorstep across Mumbai." },
          ].map((step, i) => (
            <motion.div 
              key={i}
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-rose shadow-sm">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-bold font-dmsans text-dark">{step.title}</h3>
              <p className="text-text-muted">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
