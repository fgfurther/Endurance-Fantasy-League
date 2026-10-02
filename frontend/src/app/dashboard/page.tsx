"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import type { ReactNode } from "react";
import ActivityCard from "@/components/ActivityCard";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

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

function XpTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#12122b] border-2 border-[#ffd02e] rounded-xl p-3 shadow-xl text-sm min-w-[180px]">
      <p className="font-sticker text-white text-lg mb-1">{d.name}</p>
      <p className="text-[#b9bde0] text-xs mb-2">{d.date} · {d.sport} · {d.distance} км</p>
      <p className="font-display text-xl text-[#ffd02e]">+{d.xp} XP</p>
      <p className="text-xs text-[#b9bde0] mt-1">IF ×{Number(d.intensityMult).toFixed(2)} · сон ×{Number(d.sleepMult).toFixed(2)}</p>
    </div>
  );
}

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardTab, setLeaderboardTab] = useState<"global" | "friends">("global");
  const [inviteMessage, setInviteMessage] = useState("");

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user`);
      setUserData(res.data);
    } catch {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#5866f2] flex items-center justify-center">
        <div className="font-display text-white text-2xl animate-pulse">ВИДИМ СНЫ...</div>
      </div>
    );
  }

  const isEmpty = !userData || !userData.user;
  const data = userData ?? {
    user: { name: "Атлет", level: 1, total_xp: 0, xp_to_next_level: 100 },
    recent_activities: [],
  };
  const stats = data.stats ?? { day_streak: 0, week_streak: 0, week_hours: 0, week_goal_hours: 10 };

  const chartData = [...(data.recent_activities || [])]
    .slice()
    .reverse()
    .map((act: any) => ({
      date: act.date || "",
      xp: Math.round(Number(act.xp) || 0),
      name: act.name || "Тренировка",
      sport: act.sport || "",
      distance: act.distance_km ?? 0,
      sleepMult: act.sleep_multiplier ?? 1,
      intensityMult: act.intensity_multiplier ?? 1,
    }));

  const xpProgress = isEmpty ? 0 : (data.user.total_xp % 100);

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setInviteMessage("✅ Ссылка скопирована! Отправь её друзьям");
    } catch {
      setInviteMessage("Скопируй ссылку из адресной строки 😉");
    }
    setTimeout(() => setInviteMessage(""), 3000);
  };

  const globalLeaderboard = [
    { name: "Alex Cyclist", level: 12, xp: 14500, isYou: false },
    { name: "Maria Runner", level: 9, xp: 8200, isYou: false },
    { name: data.user.name, level: data.user.level, xp: Math.round(data.user.total_xp), isYou: true },
    { name: "Ivan Swimmer", level: 5, xp: 2100, isYou: false },
  ].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));

  const friendsLeaderboard = [
    { name: "Серёга Скейтер", level: 4, xp: 1800, isYou: false },
    { name: data.user.name, level: data.user.level, xp: Math.round(data.user.total_xp), isYou: true },
    { name: "Макс Бегун", level: 3, xp: 950, isYou: false },
    { name: "Оля Пловец", level: 2, xp: 400, isYou: false },
  ].sort((a, b) => b.xp - a.xp).map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <main className="min-h-screen bg-[#5866f2] text-white p-3 sm:p-6 md:p-10 relative overflow-hidden">
      {/* Звёзды на фоне */}
      <Star className="absolute w-6 h-6 text-white top-[3%] left-[4%] animate-pulse" />
      <Star className="absolute w-4 h-4 text-white top-[8%] right-[6%] animate-pulse" />
      <Star className="absolute w-5 h-5 text-white bottom-[6%] left-[7%] animate-pulse" />
      <Star className="absolute w-6 h-6 text-white bottom-[4%] right-[4%] animate-pulse" />

      <div className="max-w-5xl mx-auto space-y-5 md:space-y-8">

        {/* Приветствие */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Sticker className="bg-[#f6b8d0] text-[#12122b] -rotate-2">твой сон = твой xp</Sticker>
            <h1 className="font-display uppercase text-4xl md:text-6xl leading-none">
              Привет, <span className="text-[#ffd02e]">{data.user.name}!</span>
            </h1>
            <p className="text-[#dcdaf5]/80 text-sm md:text-base">Твой прогресс в Dream League</p>
          </div>
          <Link
            href="/profile"
            className="px-5 py-2.5 rounded-full bg-[#e9e7f2] text-[#171a38] text-sm font-semibold hover:bg-white transition-colors self-start md:self-auto"
          >
            ⚙️ Управление данными
          </Link>
        </div>

        {/* Пустое состояние */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#171a38] rounded-[2rem] p-6 md:p-10 text-center space-y-4"
          >
            <div className="text-6xl md:text-7xl">😴</div>
            <h2 className="font-display uppercase text-2xl md:text-4xl">Ты пока спишь…</h2>
            <p className="text-[#b9bde0] text-sm md:text-base max-w-md mx-auto">
              Уровень 1 · 0 XP · 0 тренировок. Синхронизируй первую тренировку — и сон станет явью!
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 rounded-full bg-[#ffd02e] text-[#171a38] font-bold hover:scale-105 transition-transform"
            >
              ⚡ Синхронизировать тренировку
            </Link>
          </motion.div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#171a38] rounded-3xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#b9bde0] text-sm">Уровень</p>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="font-display text-5xl md:text-6xl text-[#ffd02e]">{data.user.level}</p>
            <div className="w-full bg-white/10 rounded-full h-2.5 mt-4">
              <div className="bg-[#ffd02e] h-2.5 rounded-full transition-all" style={{ width: `${xpProgress}%` }}></div>
            </div>
            <p className="text-xs text-[#b9bde0] mt-2">
              {isEmpty ? "100 XP до следующего уровня" : `${Math.round(data.user.xp_to_next_level)} XP до следующего уровня`}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-[#171a38] rounded-3xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#b9bde0] text-sm">Стрик</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="font-display text-5xl md:text-6xl text-[#ff8a3d]">
              {stats.day_streak} <span className="text-lg text-[#b9bde0]">дней</span>
            </p>
            <p className="text-sm text-[#b9bde0] mt-3">📅 {stats.week_streak} недель подряд</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#171a38] rounded-3xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#b9bde0] text-sm">Цель недели</p>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="font-display text-5xl md:text-6xl text-[#8fd64b]">
              {stats.week_hours}<span className="text-lg text-[#b9bde0]"> / {stats.week_goal_hours} ч</span>
            </p>
            <div className="w-full bg-white/10 rounded-full h-2.5 mt-4">
              <div
                className="bg-[#8fd64b] h-2.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.week_hours / stats.week_goal_hours) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-[#b9bde0] mt-2">
              {Math.min(100, Math.round((stats.week_hours / stats.week_goal_hours) * 100))}% недельной цели
            </p>
          </motion.div>
        </div>

        {/* График */}
        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#171a38] rounded-3xl p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display uppercase text-xl md:text-2xl">Динамика XP</h3>
              <Sticker className="bg-[#8fd64b] text-[#12122b] rotate-2 text-base">растёт!</Sticker>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffd02e" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ffd02e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" tick={{ fill: "#b9bde0", fontSize: 12 }} axisLine={{ stroke: "#ffffff20" }} tickLine={false} />
                  <YAxis tick={{ fill: "#b9bde0", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<XpTooltip />} cursor={{ stroke: "#ffd02e", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="xp" stroke="#ffd02e" strokeWidth={2.5} fill="url(#xpFill)"
                    activeDot={{ r: 6, fill: "#ffd02e", stroke: "#171a38", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Тренировки */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-[#171a38] rounded-3xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display uppercase text-xl md:text-2xl">Последние тренировки</h3>
            <Sticker className="bg-[#f6b8d0] text-[#12122b] rotate-2 text-base">снилось же…</Sticker>
          </div>
          {data.recent_activities.length === 0 ? (
            <p className="text-[#b9bde0] text-sm">
              Пока пусто. Синхронизируй тренировки в{" "}
              <Link href="/profile" className="text-[#ffd02e] underline">профиле</Link> — и они появятся здесь.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_activities.map((act: any, idx: number) => (
                <ActivityCard key={idx} act={act} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Рейтинг */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-[#171a38] rounded-3xl p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-display uppercase text-xl md:text-2xl">🏆 Рейтинг</h3>
            <div className="flex gap-1.5 bg-white/5 rounded-full p-1 self-start">
              <button
                onClick={() => setLeaderboardTab("global")}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                  leaderboardTab === "global" ? "bg-[#ffd02e] text-[#171a38]" : "text-[#b9bde0] hover:text-white"
                }`}
              >
                🌍 Global
              </button>
              <button
                onClick={() => setLeaderboardTab("friends")}
                className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                  leaderboardTab === "friends" ? "bg-[#ffd02e] text-[#171a38]" : "text-[#b9bde0] hover:text-white"
                }`}
              >
                👥 Friends
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(leaderboardTab === "global" ? globalLeaderboard : friendsLeaderboard).map((player) => (
              <div
                key={player.name}
                className={`flex justify-between items-center p-3 rounded-2xl ${
                  player.isYou ? "bg-[#ffd02e]/20 border-2 border-[#ffd02e]" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-display w-8 text-center text-lg ${player.rank <= 3 ? "text-[#ffd02e]" : "text-[#b9bde0]"}`}>
                    {player.rank <= 3 ? ["🥇", "", ""][player.rank - 1] : `#${player.rank}`}
                  </span>
                  <div>
                    <p className={`font-semibold ${player.isYou ? "text-[#ffd02e]" : "text-white"}`}>
                      {player.name} {player.isYou && "(Вы)"}
                    </p>
                    <p className="text-xs text-[#b9bde0]">Level {player.level}</p>
                  </div>
                </div>
                <span className="font-display text-[#7c8cff]">{player.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>

          {leaderboardTab === "friends" && (
            <>
              <button
                onClick={handleInvite}
                className="w-full mt-4 px-4 py-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-full text-sm font-semibold transition-all"
              >
                ➕ Пригласить друзей
              </button>
              {inviteMessage && <p className="text-xs text-[#8fd64b] mt-2 text-center">{inviteMessage}</p>}
            </>
          )}

          <p className="text-xs text-[#b9bde0]/60 mt-4 text-center">
            * В полной версии здесь будут реальные данные всех пользователей
          </p>
        </motion.div>
      </div>
    </main>
  );
}