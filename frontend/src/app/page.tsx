"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* Звёздочка-искорка */
function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" />
    </svg>
  );
}

/* Наклейка-стикер */
function Sticker({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      className={`font-sticker absolute z-30 px-3 py-0.5 rounded-lg border-2 border-[#12122b] shadow-[3px_4px_0_rgba(10,10,40,0.4)] text-xl font-bold whitespace-nowrap ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* Органичные "лепестки" как в референсе */
function Petals({ className = "", color = "#4d5cf0" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill={color} aria-hidden>
      <ellipse cx="55" cy="105" rx="26" ry="62" transform="rotate(-24 55 105)" />
      <ellipse cx="100" cy="95" rx="28" ry="72" />
      <ellipse cx="145" cy="105" rx="26" ry="62" transform="rotate(24 145 105)" />
    </svg>
  );
}

/* Пузырь сна с эмодзи */
function DreamBubble({ emoji, className = "", delay = 0 }: { emoji: string; className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 4, delay, ease: "easeInOut" }}
      className={`absolute z-20 flex items-center justify-center rounded-full bg-[#f3f1fb] shadow-xl ${className}`}
    >
      <span>{emoji}</span>
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#5866f2] flex items-center justify-center p-3 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Звёзды на фоне */}
      <Star className="absolute w-6 h-6 text-white top-[6%] left-[5%] animate-pulse" />
      <Star className="absolute w-4 h-4 text-white top-[12%] right-[8%] animate-pulse" />
      <Star className="absolute w-5 h-5 text-white bottom-[10%] left-[10%] animate-pulse" />
      <Star className="absolute w-7 h-7 text-white bottom-[6%] right-[5%] animate-pulse" />

      <div className="relative w-full max-w-6xl">
        {/* Стикеры по краям карточки */}
        <Sticker className="-top-4 right-4 md:-top-6 md:-right-6 bg-[#f6b8d0] text-[#12122b] rotate-6">
          SWEET DREAMS
        </Sticker>
        <Sticker className="top-1/3 -right-2 md:-right-10 bg-[#ffd02e] text-[#12122b] rotate-3 hidden sm:block">
          XP КАПАЕТ ВО СНЕ!
        </Sticker>
        <Sticker className="bottom-1/4 -left-2 md:-left-10 bg-[#ff8a3d] text-[#12122b] -rotate-6 hidden sm:block">
          НЕ БУДИ
        </Sticker>
        <Sticker className="-bottom-5 right-10 bg-white text-[#12122b] -rotate-3">
          Zzz…
        </Sticker>

        {/* Тёмная "сцена" */}
        <div className="relative rounded-[2rem] bg-[#171a38] overflow-hidden px-4 pt-6 md:px-10 md:pt-8 shadow-2xl">
          {/* Навигация */}
          <nav className="relative z-10 flex items-center justify-between gap-2">
            <Link href="/" className="font-display text-white text-lg md:text-2xl tracking-wide">
              DREAM<span className="text-[#ffd02e]">✦</span>LEAGUE
            </Link>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Link
                href="/dashboard"
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#e9e7f2] text-[#171a38] text-xs md:text-sm font-semibold hover:bg-white transition-colors"
              >
                Дашборд
              </Link>
              <Link
                href="/profile"
                className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#e9e7f2] text-[#171a38] text-xs md:text-sm font-semibold hover:bg-white transition-colors"
              >
                Профиль
              </Link>
            </div>
          </nav>

          {/* Hero */}
          <div className="relative z-10 text-center mt-8 md:mt-14 space-y-4 md:space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display uppercase text-white text-5xl sm:text-7xl md:text-8xl leading-none"
            >
              Respect the <span className="text-[#ffd02e]">Sleep</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-[#b9bde0] text-sm md:text-base max-w-md mx-auto"
            >
              Фэнтези-лига для атлетов на выносливость: тренировки приносят XP,
              сон умножает их, а друзья соревнуются с тобой в рейтинге.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap justify-center gap-3 pb-8 md:pb-10"
            >
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full bg-[#ffd02e] text-[#171a38] font-bold hover:scale-105 transition-transform"
              >
                🏆 Начать играть
              </Link>
              <Link
                href="/profile"
                className="px-6 py-3 rounded-full border-2 border-[#e9e7f2]/40 text-[#e9e7f2] font-semibold hover:bg-white/10 transition-colors"
              >
                Источники данных
              </Link>
            </motion.div>
          </div>

          {/* Иллюстрация: спящий атлет и сны */}
          <div className="relative h-56 md:h-72">
            {/* Розовые облака */}
            <div className="absolute -left-10 top-4 w-40 h-44 bg-[#f6b8d0] rounded-[50%_50%_40%_60%]" />
            <div className="absolute right-8 top-8 w-24 h-24 bg-[#f6b8d0] rounded-[60%_40%_55%_45%]" />

            {/* Лепестки */}
            <Petals className="absolute -left-4 -bottom-4 w-52 md:w-72" color="#4d5cf0" />
            <Petals className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-56 md:w-80" color="#2e3ab0" />
            <Petals className="absolute -right-4 -bottom-4 w-52 md:w-72" color="#4d5cf0" />

            {/* Зелёный росток */}
            <div className="absolute left-[22%] -bottom-2 w-14 h-24 bg-[#8fd64b] rounded-t-full" />

            {/* Спящий атлет */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute left-1/2 -translate-x-1/2 bottom-4 text-7xl md:text-8xl z-10"
            >
              😴
            </motion.div>

            {/* Пузыри снов */}
            <DreamBubble emoji="🚴" className="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl left-[28%] top-6" delay={0.3} />
            <DreamBubble emoji="🏃" className="w-10 h-10 md:w-14 md:h-14 text-xl md:text-2xl left-[48%] top-0" delay={1.1} />
            <DreamBubble emoji="🏆" className="w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl left-[64%] top-8" delay={0.7} />

            {/* Звёзды внутри сцены */}
            <Star className="absolute w-5 h-5 text-white left-[18%] top-10 animate-pulse" />
            <Star className="absolute w-4 h-4 text-white right-[22%] top-4 animate-pulse" />
            <Star className="absolute w-3 h-3 text-white right-[38%] top-16 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}