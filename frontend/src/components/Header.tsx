"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Home, LayoutDashboard, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  // Не показываем шапку на главной странице
  if (pathname === "/") return null;

  const links = [
    { href: "/", label: "Главная", icon: Home },
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/profile", label: "Профиль", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Fantasy League
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isActive
                    ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/10 border-transparent"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}