"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // На главной шапка не нужна (там своя навигация)
  if (pathname === "/") return null;

  const links = [
    { href: "/dashboard", label: "Дашборд" },
    { href: "/profile", label: "Профиль" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#5866f2]/90 backdrop-blur-md">
      <div className="px-3 sm:px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 py-3 md:py-4">
          <Link
            href="/"
            className="font-display text-white text-lg md:text-2xl tracking-wide drop-shadow-[2px_2px_0_rgba(10,10,40,0.4)]"
          >
            DREAM<span className="text-[#ffd02e]">✦</span>LEAGUE
          </Link>

          <nav className="flex items-center gap-1.5 md:gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#ffd02e] text-[#171a38]"
                      : "bg-[#e9e7f2] text-[#171a38] hover:bg-white"
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
  );
}