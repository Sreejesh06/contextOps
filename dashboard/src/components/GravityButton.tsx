"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function GravityButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="relative px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-shadow duration-500"
    >
      {/* Glare effect inside button */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "200%" : "-100%" }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <Sparkles className="w-5 h-5 text-black" />
      <span>Apply AI Fix</span>
    </motion.button>
  );
}
