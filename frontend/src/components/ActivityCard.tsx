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
    multiplier >= 1.2 ? "text-[#ff8a3d]" :
    multiplier >= 1.0 ? "text-[#ffd02e]" :
    multiplier >= 0.7 ? "text-[#8fd64b]" : "text-[#7c8cff]";

  const multiplierLabel =
    multiplier >= 1.2 ? "🔥 Высокая" :
    multiplier >= 1.0 ? "⚡ Средняя" :
    multiplier >= 0.7 ? "🌿 Низкая" : "💤 Восстановление";

  const sleepMult = Number(act.sleep_multiplier ?? 1);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowTooltip(true), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setTimeout(() => setShowTooltip(false), 100);
  };
  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div
      className="group relative flex justify-between items-center gap-3 p-3 md:p-4 bg-white/5 rounded-2xl border-2 border-transparent hover:border-[#ffd02e]/60 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className="text-2xl md:text-3xl shrink-0">
          {act.sport === "RUN" ? "🏃" :
           act.sport === "RIDE" ? "🚴" :
           act.sport === "SWIM" ? "🏊" :
           act.sport === "SKATEBOARD" ? "🛹" : "🏋️"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{act.name}</p>
          <p className="text-sm text-[#b9bde0]">
            {act.date} • {act.distance_km} км • {act.moving_time_min} мин
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-display text-xl md:text-2xl text-[#ffd02e]">+{Math.round(act.xp)}</p>
        <p className="text-[10px] text-[#b9bde0] uppercase tracking-widest">XP · {act.sport}</p>
      </div>

      {/* Tooltip */}
      <div
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-200 pointer-events-none z-30 ${
          showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="bg-[#12122b] border-2 border-[#ffd02e] rounded-xl p-3 shadow-xl min-w-[210px]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#b9bde0]">Базовый XP:</span>
              <span className="text-white font-mono">{Math.round(act.base_xp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b9bde0]">Интенсивность:</span>
              <span className={`font-mono font-bold ${multiplierColor}`}>×{multiplier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b9bde0]">Нагрузка:</span>
              <span className={`text-xs ${multiplierColor}`}>{multiplierLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#b9bde0]">Сон:</span>
              <span className="font-mono font-bold text-[#7c8cff]">
                {act.sleep_hours != null ? `${act.sleep_hours}ч ` : ""}×{sleepMult.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-[#b9bde0]">Итого:</span>
              <span className="font-display text-[#ffd02e]">+{Math.round(act.xp)} XP</span>
            </div>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#12122b] border-r-2 border-b-2 border-[#ffd02e] rotate-45"></div>
      </div>
    </div>
  );
}