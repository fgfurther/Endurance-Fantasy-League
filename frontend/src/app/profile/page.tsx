"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import type { ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" />
    </svg>
  );
}

function Sticker({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`font-sticker inline-block px-3 py-0.5 rounded-lg border-2 border-[#12122b] shadow-[3px_4px_0_rgba(10,10,40,0.4)] text-lg font-bold ${className}`}>
      {children}
    </span>
  );
}

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user`);
      setUserData(res.data);
    } catch {
      setUserData(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSyncIntervals = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/sync`);
      setMessage({
        type: "success",
        text: `✅ Синхронизация завершена! Тренировок: ${res.data.synced_count} · +${Math.round(res.data.new_xp)} XP`,
      });
      await fetchUser();
    } catch {
      setMessage({ type: "error", text: "❌ Ошибка синхронизации. Проверь, что бэкенд запущен." });
    } finally {
      setSyncing(false);
    }
  };

  const handleStub = (source: string) => {
    setMessage({ type: "info", text: `🚧 Синхронизация с ${source} в разработке — появится в следующей версии!` });
  };

  const handleReset = async () => {
    if (!confirm("Вы уверены? Все тренировки и XP будут удалены.")) return;
    setResetting(true);
    setMessage(null);
    try {
      await axios.delete(`${API_URL}/api/reset`);
      setUserData(null);
      setMessage({ type: "success", text: "🗑 Данные успешно очищены" });
    } catch {
      setMessage({ type: "error", text: "❌ Ошибка при очистке данных" });
    } finally {
      setResetting(false);
    }
  };

  const seasonStats = userData?.season_stats ?? {
    season_start: "01.09.2026",
    total_km: 0,
    total_hours: 0,
    total_elevation: 0,
    total_workouts: 0,
    total_xp: 0,
  };

  const sources = [
    {
      name: "Intervals.icu",
      desc: "Агрегатор Strava, Garmin, Wahoo и других",
      emoji: "🔌",
      bg: "bg-[#4d5cf0]",
      status: "connected",
      label: "Синхронизировать Intervals",
      onClick: handleSyncIntervals,
      loading: syncing,
    },
    {
      name: "Garmin",
      desc: "Прямое подключение Garmin Connect",
      emoji: "",
      bg: "bg-[#38bdf8]",
      status: "soon",
      label: "Синхронизировать Garmin",
      onClick: () => handleStub("Garmin"),
      loading: false,
    },
    {
      name: "Strava",
      desc: "Прямое подключение Strava",
      emoji: "🚴",
      bg: "bg-[#ff8a3d]",
      status: "soon",
      label: "Синхронизировать Strava",
      onClick: () => handleStub("Strava"),
      loading: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#5866f2] text-white p-3 sm:p-6 md:p-10 relative overflow-hidden">
      <Star className="absolute w-6 h-6 text-white top-[4%] left-[5%] animate-pulse" />
      <Star className="absolute w-4 h-4 text-white top-[10%] right-[7%] animate-pulse" />
      <Star className="absolute w-5 h-5 text-white bottom-[7%] left-[8%] animate-pulse" />
      <Star className="absolute w-6 h-6 text-white bottom-[5%] right-[5%] animate-pulse" />

      <div className="max-w-3xl mx-auto space-y-5 md:space-y-8">

        {/* Заголовок */}
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-3">
            <Sticker className="bg-[#8fd64b] text-[#12122b] -rotate-2">кабинет атлета</Sticker>
            <h1 className="font-display uppercase text-4xl md:text-6xl leading-none">
              Про<span className="text-[#ffd02e]">филь</span>
            </h1>
          </div>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-[#e9e7f2] text-[#171a38] text-sm font-semibold hover:bg-white transition-colors">
            ← К дашборду
          </Link>
        </div>

        {/* Сообщения */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-3 md:p-4 rounded-2xl border-2 text-sm md:text-base font-medium ${
              message.type === "success" ? "bg-[#8fd64b]/20 border-[#8fd64b] text-[#8fd64b]" :
              message.type === "error" ? "bg-[#ff8a3d]/20 border-[#ff8a3d] text-[#ff8a3d]" :
              "bg-[#7c8cff]/20 border-[#7c8cff] text-[#aab6ff]"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Карточка профиля */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#171a38] rounded-[2rem] p-4 md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#ffd02e] flex items-center justify-center font-display text-3xl md:text-4xl text-[#171a38] shrink-0">
              {userData ? userData.user.name.charAt(0) : "😴"}
            </div>
            <div className="min-w-0">
              <h2 className="font-display uppercase text-2xl md:text-3xl truncate">
                {userData ? userData.user.name : "Атлет"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-[#ffd02e]/20 border-2 border-[#ffd02e] rounded-full text-[#ffd02e] text-xs font-bold">
                  ⭐ Уровень {userData ? userData.user.level : 1}
                </span>
                <span className="px-3 py-1 bg-[#f6b8d0]/20 border-2 border-[#f6b8d0] rounded-full text-[#f6b8d0] text-xs font-bold">
                  ⚡ {Math.round(userData ? userData.user.total_xp : 0)} XP
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Статистика сезона */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#171a38] rounded-3xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display uppercase text-xl md:text-2xl">📊 Статистика сезона</h3>
            <span className="font-sticker text-[#f6b8d0] text-lg">с {seasonStats.season_start}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {[
              { icon: "🛣️", label: "Дистанция", value: `${seasonStats.total_km} км` },
              { icon: "⏱️", label: "Время", value: `${seasonStats.total_hours} ч` },
              { icon: "⛰️", label: "Набор", value: `${seasonStats.total_elevation} м` },
              { icon: "🏋️", label: "Тренировок", value: `${seasonStats.total_workouts}` },
              { icon: "⚡", label: "XP", value: `${Math.round(seasonStats.total_xp)}` },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center hover:bg-white/10 transition-colors">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="font-display text-lg md:text-xl text-white">{s.value}</div>
                <div className="text-[11px] text-[#b9bde0] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Источники данных */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-display uppercase text-xl md:text-2xl">Источники данных</h3>
            <Sticker className="bg-[#ffd02e] text-[#12122b] rotate-2 text-base">подключи сон</Sticker>
          </div>
          <div className="space-y-3">
            {sources.map((source, idx) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.1 }}
                className="bg-[#171a38] rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className={`w-12 h-12 rounded-2xl ${source.bg} flex items-center justify-center text-2xl shrink-0`}>
                  {source.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display uppercase text-lg">{source.name}</p>
                    {source.status === "connected" ? (
                      <span className="px-2 py-0.5 bg-[#8fd64b]/20 border border-[#8fd64b] rounded-full text-[#8fd64b] text-[10px] font-bold uppercase">
                        Подключено
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[#b9bde0] text-[10px] font-bold uppercase">
                        Скоро
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#b9bde0] truncate">{source.desc}</p>
                </div>
                <button
                  onClick={source.onClick}
                  disabled={source.loading}
                  className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all shrink-0 ${
                    source.status === "connected"
                      ? "bg-[#ffd02e] text-[#171a38] hover:scale-105"
                      : "bg-white/10 text-[#b9bde0] hover:bg-white/20"
                  } disabled:opacity-50`}
                >
                  {source.loading ? "Синхронизация..." : source.label}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Опасная зона */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-[#171a38] border-2 border-[#ff8a3d] rounded-3xl p-4 md:p-6"
        >
          <h3 className="font-display uppercase text-xl text-[#ff8a3d] mb-2"> Опасная зона</h3>
          <p className="text-sm text-[#b9bde0] mb-4">
            Полностью удаляет все синхронизированные тренировки и сбрасывает прогресс до 1 уровня.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting || !userData}
            className="px-5 py-2.5 bg-[#ff8a3d]/20 hover:bg-[#ff8a3d]/40 text-[#ff8a3d] border-2 border-[#ff8a3d] rounded-full text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resetting ? "Очистка..." : "🗑 Очистить все данные"}
          </button>
        </motion.div>

        <p className="font-sticker text-center text-white/70 text-xl pb-4">
          сладких снов и быстрых ног ✨
        </p>
      </div>
    </main>
  );
}