"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  primaryActionText = "Okay",
  onPrimaryAction,
}: AlertDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%", x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md p-4 outline-none"
          >
            <div className="bg-cream rounded-2xl shadow-xl overflow-hidden border border-rose/10">
              <div className="p-6 relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 text-text-muted hover:text-dark transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="mb-2">
                  <h2 className="text-[22px] font-playfair font-bold text-dark leading-tight">{title}</h2>
                </div>
                <p className="text-text-muted font-dmsans text-[15px] leading-relaxed mb-6">
                  {description}
                </p>
                <div className="flex justify-end gap-3 font-dmsans">
                  <Button variant="ghost" onClick={onClose} className="hover:bg-dark/5">
                    Cancel
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => {
                      if (onPrimaryAction) onPrimaryAction();
                      else onClose();
                    }}
                  >
                    {primaryActionText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
