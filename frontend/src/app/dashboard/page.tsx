"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, TrendingUp, Calendar, Trophy, Settings, ArrowRight } from "lucide-react";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function XpTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-indigo-500/50 rounded-lg p-3 shadow-xl text-sm min-w-[180px]">
      <p className="text-white font-medium mb-1">{d.name}</p>
      <p className="text-gray-400 text-xs mb-2">
        {d.date} · {d.sport} · {d.distance} км
      </p>
      <p className="text-yellow-400 font-bold text-lg">+{d.xp} XP</p>
      <p className="text-xs text-gray-500 mt-1">
        IF ×{Number(d.intensityMult).toFixed(2)} · сон ×{Number(d.sleepMult).toFixed(2)}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user`);
      setUserData(res.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
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
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-indigo-400 text-xl animate-pulse">Загрузка данных атлета...</div>
      </div>
    );
  }

  const isEmpty = !userData || !userData.user;

  // Данные по умолчанию для пустого состояния
  const data = userData ?? {
    user: { name: "Атлет", level: 1, total_xp: 0, xp_to_next_level: 100 },
    recent_activities: [],
  };

  // График: от старых к новым
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

  // Лидерборд с сортировкой
  const leaderboard = [
    { name: "Alex Cyclist", level: 12, xp: 14500, isYou: false },
    { name: "Maria Runner", level: 9, xp: 8200, isYou: false },
    { name: data.user.name, level: data.user.level, xp: Math.round(data.user.total_xp), isYou: true },
    { name: "Ivan Swimmer", level: 5, xp: 2100, isYou: false },
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return (
    <main className="min-h-screen gradient-bg text-white p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-5 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Привет, {data.user.name}!
            </h1>
            <p className="text-gray-400 mt-1 text-sm md:text-base">
              {isEmpty ? "Твой прогресс пока пустой" : "Твой прогресс в Fantasy League"}
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Управление данными
          </Link>
        </div>

        {/* Пустое состояние */}
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/40 rounded-xl p-5 md:p-8 text-center space-y-4"
          >
            <div className="text-5xl">🏁</div>
            <h2 className="text-xl md:text-2xl font-bold">У тебя пока нет тренировок</h2>
            <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto">
              Ты — <span className="text-yellow-300 font-semibold">Уровень 1</span> с <span className="text-indigo-300 font-semibold">0 XP</span>.
              Подключи источник данных в профиле, синхронизируй первую тренировку и получи свой первый опыт!
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              ⚡ Синхронизировать тренировку
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Уровень</p>
                <p className="text-3xl font-bold">{data.user.level}</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEmpty ? "100 XP до следующего уровня" : `${Math.round(data.user.xp_to_next_level)} XP до следующего уровня`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Всего XP</p>
                <p className="text-3xl font-bold">{Math.round(data.user.total_xp)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Тренировок</p>
                <p className="text-3xl font-bold">{data.recent_activities.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Лидерборд */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 md:p-6"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Глобальный рейтинг (Демо)
          </h3>
          <div className="space-y-2">
            {leaderboard.map((player) => (
              <div
                key={player.rank}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  player.isYou ? "bg-yellow-500/20 border border-yellow-500/50" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold w-6 text-center ${player.rank <= 3 ? "text-yellow-400" : "text-gray-400"}`}>
                    #{player.rank}
                  </span>
                  <div>
                    <p className={`font-medium ${player.isYou ? "text-yellow-300" : "text-white"}`}>
                      {player.name} {player.isYou && "(Вы)"}
                    </p>
                    <p className="text-xs text-gray-400">Level {player.level}</p>
                  </div>
                </div>
                <span className="font-mono text-indigo-300">{player.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            * В полной версии здесь будут реальные данные всех пользователей
          </p>
        </motion.div>

        {/* График прогресса XP */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Динамика получения XP
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={{ stroke: "#ffffff20" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<XpTooltip />} cursor={{ stroke: "#818cf8", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="xp"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fill="url(#xpFill)"
                    activeDot={{ r: 6, fill: "#a5b4fc", stroke: "#312e81", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Последние тренировки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4">Последние тренировки</h3>
          {data.recent_activities.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Пока пусто. Синхронизируй тренировки в{" "}
              <Link href="/profile" className="text-indigo-400 hover:text-indigo-300 underline">
                профиле
              </Link>
              — и они появятся здесь.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_activities.map((act: any, idx: number) => {
                const multiplier = act.intensity_multiplier || 1.0;
                const multiplierColor =
                  multiplier >= 1.2 ? "text-red-400" :
                  multiplier >= 1.0 ? "text-yellow-400" :
                  multiplier >= 0.7 ? "text-green-400" : "text-blue-400";
                const multiplierLabel =
                  multiplier >= 1.2 ? "🔥 Высокая" :
                  multiplier >= 1.0 ? "⚡ Средняя" :
                  multiplier >= 0.7 ? "🌿 Низкая" : "💤 Восстановление";

                
                const sleepMult = Number(act.sleep_multiplier ?? 1);
                const sleepColor =
                  sleepMult >= 1.4 ? "text-cyan-300" :
                  sleepMult >= 1.0 ? "text-cyan-400" :
                  sleepMult >= 0.7 ? "text-yellow-400" :
                  "text-orange-400";

                return (
                  <div
                    key={idx}
                    className="group relative flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-2xl shrink-0">
                        {act.sport === "RUN" ? "🏃" :
                         act.sport === "RIDE" ? "🚴" :
                         act.sport === "SWIM" ? "🏊" :
                         act.sport === "SKATEBOARD" ? "🛹" : "🏋️"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{act.name}</p>
                        <p className="text-sm text-gray-400">
                          {act.date} • {act.distance_km} км • {act.moving_time_min} мин
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-yellow-400 font-bold text-lg">+{Math.round(act.xp)} XP</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{act.sport}</p>
                    </div>

                    {/* Tooltip при наведении */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-900 border border-indigo-500/50 rounded-lg p-3 shadow-xl min-w-[200px]">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Базовый XP:</span>
                            <span className="text-white font-mono">{Math.round(act.base_xp)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Интенсивность:</span>
                            <span className={`font-mono font-bold ${multiplierColor}`}>
                              ×{multiplier.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Нагрузка:</span>
                            <span className={`text-xs ${multiplierColor}`}>{multiplierLabel}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Сон:</span>
                            <span className="font-mono font-bold text-cyan-400">
                              {act.sleep_hours != null ? `${act.sleep_hours}ч ` : ""}
                              ×{sleepMult.toFixed(2)}
                            </span>
                          </div>
                          <div className="border-t border-gray-700 pt-2 flex justify-between">
                            <span className="text-gray-400">Итого:</span>
                            <span className="text-yellow-400 font-bold font-mono">
                              +{Math.round(act.xp)} XP
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="w-2 h-2 bg-gray-900 border-r border-b border-indigo-500/50 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        
      </div>
    </main>
  );
}