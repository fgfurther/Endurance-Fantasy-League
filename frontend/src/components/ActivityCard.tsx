"use client";

import { useState, useRef } from "react";

interface Activity {
  name: string;
  sport: string;
  date: string;
  distance_km: number;
  moving_time_min: number;
  xp: number;
  base_xp: number;
  intensity_multiplier: number;
  sleep_multiplier?: number;
  sleep_hours?: number;
}

export default function ActivityCard({ act }: { act: Activity }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Обработчики для long press на мобильных
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500); // 500ms для long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Скрываем tooltip через короткую задержку после отпускания
    setTimeout(() => setShowTooltip(false), 100);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className="group relative flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-lg 
                 hover:bg-white/10 transition-all duration-300 ease-out border border-white/5 
                 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20
                 active:scale-[0.98] touch-manipulation"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
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

      {/* Tooltip */}
      <div
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                   transition-all duration-200 pointer-events-none z-10
                   ${showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
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
        </div>
        {/* Стрелочка */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="w-2 h-2 bg-gray-900 border-r border-b border-indigo-500/50 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
}