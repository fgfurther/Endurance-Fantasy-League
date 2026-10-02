"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ✦ Звезда-искорка */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" />
    </svg>
  );
}

/* 🏷 Стикер Caveat — нарушает строгую рамку */
export function Sticker({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className={`font-sticker absolute z-30 px-3 py-0.5 rounded-lg border-2 border-black shadow-[3px_4px_0_rgba(0,0,0,0.35)] text-lg md:text-xl font-bold whitespace-nowrap ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* 💭 Пузырь сна */
export function DreamBubble({ emoji, className = "", delay = 0 }: { emoji: string; className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -9, 0] }}
      transition={{ repeat: Infinity, duration: 3.5, delay, ease: "easeInOut" }}
      className={`absolute z-20 flex items-center justify-center rounded-full bg-[#f4f4f0] border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,0.4)] ${className}`}
    >
      <span>{emoji}</span>
    </motion.div>
  );
}

/* 🌐 Глобус */
export function GlobeIcon({ className = "w-9 h-9 md:w-12 md:h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="#111" strokeWidth="5">
      <circle cx="50" cy="50" r="44" />
      <ellipse cx="50" cy="50" rx="20" ry="44" />
      <line x1="6" y1="50" x2="94" y2="50" />
      <line x1="13" y1="28" x2="87" y2="28" />
      <line x1="13" y1="72" x2="87" y2="72" />
    </svg>
  );
}

/* 🫧 Еле заметные сонные фигуры для разбавления серых контейнеров */
export function DreamDecor({ variant = "a" }: { variant?: "a" | "b" | "c" }) {
  const sets = {
    a: (
      <>
        <span className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-[#5866f2] opacity-[0.12]" />
        <span className="absolute right-7 bottom-2 w-5 h-5 rounded-full bg-[#f6b8d0] opacity-25" />
        <span className="absolute left-1/2 top-2 w-3 h-3 rotate-45 bg-[#ffd500] opacity-20" />
      </>
    ),
    b: (
      <>
        <span className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-[#f6b8d0] opacity-[0.14]" />
        <span className="absolute right-5 top-3 w-7 h-7 rounded-full border-2 border-[#5866f2] opacity-20" />
        <Star className="absolute right-1/3 bottom-3 w-4 h-4 text-[#5866f2] opacity-20" />
      </>
    ),
    c: (
      <>
        <span className="absolute right-3 -top-6 w-16 h-16 rounded-[50%_50%_40%_60%] bg-[#ffd500] opacity-[0.16]" />
        <span className="absolute left-5 bottom-3 w-4 h-4 rounded-full bg-[#5866f2] opacity-20" />
        <span className="absolute left-1/3 top-2 w-9 h-9 rounded-full border-2 border-[#f6b8d0] opacity-25" />
      </>
    ),
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {sets[variant]}
    </div>
  );
}