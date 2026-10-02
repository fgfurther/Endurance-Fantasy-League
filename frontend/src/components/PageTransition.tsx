"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

const ORDER: Record<string, number> = { "/dashboard": 1, "/profile": 2 };

type Dir = "home-in" | "home-out" | "right" | "left" | "fade";

function getDir(from: string, to: string): Dir {
  if (to === "/") return "home-in";
  if (from === "/") return "home-out";
  const o1 = ORDER[from] ?? 0;
  const o2 = ORDER[to] ?? 0;
  if (o2 > o1) return "right";
  if (o2 < o1) return "left";
  return "fade";
}

const EASE = [0.22, 1, 0.36, 1] as const;

const variants: Record<Dir, Variants> = {
  "home-in": {
    initial: { clipPath: "circle(0% at 50% 50%)", opacity: 0, filter: "blur(14px)" },
    animate: { clipPath: "circle(150% at 50% 50%)", opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
    exit: { opacity: 0, filter: "blur(12px)", transition: { duration: 0.45, ease: EASE } },
  },
  "home-out": {
    initial: { opacity: 0, filter: "blur(12px)" },
    animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
    exit: { clipPath: "circle(0% at 50% 50%)", opacity: 0, transition: { duration: 0.6, ease: EASE } },
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { x: "-100%", transition: { duration: 0.5, ease: EASE } },
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { x: "100%", transition: { duration: 0.5, ease: EASE } },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const cache = useRef<Record<string, ReactNode>>({});
  const lastPath = useRef(pathname);
  const dir = useRef<Dir>("fade");

  cache.current[pathname] = children;
  if (pathname !== lastPath.current) {
    dir.current = getDir(lastPath.current, pathname);
    lastPath.current = pathname;
  }
  
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#171a38] via-[#2a2f6b] to-[#5866f2]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          variants={variants[dir.current]}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {cache.current[pathname]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}