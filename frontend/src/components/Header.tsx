
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "@/components/DreamBits";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60] w-full isolate text-[#111] pointer-events-none">
        {/* Декоративные звёзды */}
        <Star className="absolute w-4 h-4 text-white/70 top-2 left-[3%] animate-pulse pointer-events-none" />
        <Star className="absolute w-3 h-3 text-[#ffd500] bottom-1 right-[4%] animate-pulse pointer-events-none" />

        <div className="px-2 sm:px-4 md:px-6 pt-2 sm:pt-4 md:pt-6 pb-2 pointer-events-none">
          <div className="max-w-[1400px] mx-auto border-2 border-black bg-[#f4f4f0] flex items-stretch shadow-[4px_4px_0_rgba(0,0,0,0.2)] pointer-events-auto">
            <Link
              href="/"
              className="px-5 py-4 border-r-2 border-black font-display text-xl md:text-2xl hover:bg-black hover:text-white transition-colors"
            >
              FANTASY<span className="text-[#ff4b26]">.</span>
            </Link>

            <div className="hidden md:flex items-center px-5 border-r-2 border-black text-[10px] font-bold tracking-widest uppercase leading-relaxed">
              Season 001
              <br />
              Endurance Fantasy league
            </div>

            <nav className="flex items-stretch ml-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 md:px-7 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center border-l-2 border-black transition-colors ${
                      isActive
                        ? "bg-[#5866f2] text-white"
                        : "hover:bg-black hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Резервируем место под fixed-header */}
      <div
        className="h-[72px] sm:h-[80px] md:h-[88px]"
        aria-hidden="true"
      />
    </>
  );
}

