"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, Trash2, Zap, Trophy, Cable, Watch, Bike, ArrowLeft, BarChart3 } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      icon: Cable,
      color: "from-indigo-500 to-purple-500",
      status: "connected",
      label: "Синхронизировать Intervals",
      onClick: handleSyncIntervals,
      loading: syncing,
    },
    {
      name: "Garmin",
      desc: "Прямое подключение Garmin Connect",
      icon: Watch,
      color: "from-blue-500 to-cyan-500",
      status: "soon",
      label: "Синхронизировать Garmin",
      onClick: () => handleStub("Garmin"),
      loading: false,
    },
    {
      name: "Strava",
      desc: "Прямое подключение Strava",
      icon: Bike,
      color: "from-orange-500 to-red-500",
      status: "soon",
      label: "Синхронизировать Strava",
      onClick: () => handleStub("Strava"),
      loading: false,
    },
  ];

  return (
    <main className="min-h-screen gradient-bg text-white p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-5 md:space-y-8">

        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Профиль
          </h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> К дашборду
          </Link>
        </div>

        {/* Сообщения */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 md:p-4 rounded-lg border text-sm md:text-base ${
              message.type === "success" ? "bg-green-500/10 border-green-500/50 text-green-300" :
              message.type === "error" ? "bg-red-500/10 border-red-500/50 text-red-300" :
              "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Карточка профиля */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-2xl md:text-3xl font-bold shrink-0">
              {userData ? userData.user.name.charAt(0) : "🏃"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-bold truncate">
                {userData ? userData.user.name : "Атлет"}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-xs font-medium">
                  Уровень {userData ? userData.user.level : 1}
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 text-xs font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {Math.round(userData ? userData.user.total_xp : 0)} XP
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Статистика сезона */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Статистика сезона
            </h3>
            <span className="text-xs text-gray-500">Сезон №1 · с {seasonStats.season_start}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
            {[
              { icon: "🛣️", label: "Дистанция", value: `${seasonStats.total_km} км` },
              { icon: "⏱️", label: "Время", value: `${seasonStats.total_hours} ч` },
              { icon: "⛰️", label: "Набор высоты", value: `${seasonStats.total_elevation} м` },
              { icon: "🏋️", label: "Тренировок", value: `${seasonStats.total_workouts}` },
              { icon: "⚡", label: "XP за сезон", value: `${Math.round(seasonStats.total_xp)}` },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-base md:text-lg font-bold text-white">{s.value}</div>
                <div className="text-[11px] md:text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>


        {/* Источники данных */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Источники данных</h3>
          <div className="space-y-3">
            {sources.map((source, idx) => (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${source.color} flex items-center justify-center shrink-0`}>
                  <source.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{source.name}</p>
                    {source.status === "connected" ? (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-[10px] font-medium uppercase">
                        Подключено
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-500/20 border border-gray-500/50 rounded-full text-gray-400 text-[10px] font-medium uppercase">
                        Скоро
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{source.desc}</p>
                </div>
                <button
                  onClick={source.onClick}
                  disabled={source.loading}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shrink-0 ${
                    source.status === "connected"
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-gray-300"
                  } disabled:opacity-50`}
                >
                  <RefreshCw className={`w-4 h-4 ${source.loading ? "animate-spin" : ""}`} />
                  {source.loading ? "Синхронизация..." : source.label}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Опасная зона */}
        <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Опасная зона</h3>
          <p className="text-sm text-gray-400 mb-4">
            Полностью удаляет все синхронизированные тренировки и сбрасывает прогресс до 1 уровня.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting || !userData}
            className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {resetting ? "Очистка..." : "Очистить все данные"}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 justify-center pb-4">
          <Trophy className="w-4 h-4" />
          Fantasy League · Профиль атлета
        </div>
      </div>
    </main>
  );
}