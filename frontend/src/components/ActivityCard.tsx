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
    multiplier >= 0.7 ? "text-[#ff4b26]" :
    multiplier >= 0.5 ? "text-black" :
    multiplier >= 0.3 ? "text-[#666]" : "text-[#5866f2]";

  const multiplierLabel =
    multiplier >= 0.7 ? "HIGH" :
    multiplier >= 0.5 ? "MEDIUM" :
    multiplier >= 0.3 ? "LOW" : "RECOVERY";

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
      className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-0 border-2 border-black bg-white hover:bg-[#5866f2]/10 hover:border-[#5866f2] transition-colors cursor-pointer touch-manipulation"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 border-r-2 border-black flex items-center justify-center text-xl md:text-2xl bg-[#f4f4f0]">
        {act.sport === "RUN" ? "🏃" :
         act.sport === "RIDE" ? "🚴" :
         act.sport === "SWIM" ? "🏊" :
         act.sport === "SKATEBOARD" ? "🛹" : "🏋️"}
      </div>

      <div className="px-3 md:px-4 py-2 min-w-0">
        <p className="font-bold uppercase tracking-wide truncate text-sm md:text-base">{act.name}</p>
        <p className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-[#666] mt-0.5">
          {act.date} · {act.distance_km} km · {act.moving_time_min} min
        </p>
      </div>

      <div className="px-3 md:px-4 py-2 border-l-2 border-black text-right bg-[#f4f4f0]">
        <p className="font-display text-lg md:text-xl text-[#ff4b26]">+{Math.round(act.xp)}</p>
        <p className="text-[9px] font-bold tracking-widest uppercase text-[#666]">XP</p>
      </div>

      {/* Tooltip — тёмно-синий (Dream) с чёрной рамкой и BRUT-тенью */}
      <div
        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-all duration-200 pointer-events-none z-30 ${
          showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="bg-[#171a38] text-white border-2 border-black p-3 shadow-[4px_4px_0_#000] min-w-[220px] text-sm">
          <div className="space-y-1.5">
            <div className="flex justify-between border-b border-white/20 pb-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">Base XP</span>
              <span className="font-grotesk font-bold">{Math.round(act.base_xp)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">Intensity</span>
              <span className={`font-grotesk font-bold ${multiplierColor}`}>×{multiplier.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">Load</span>
              <span className={`text-[10px] font-bold tracking-widest uppercase ${multiplierColor}`}>{multiplierLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">Sleep</span>
              <span className="font-grotesk font-bold text-[#f6b8d0]">
                {act.sleep_hours != null ? `${act.sleep_hours}h ` : ""}×{sleepMult.toFixed(2)}
              </span>
            </div>
            <div className="border-t-2 border-black pt-1.5 flex justify-between">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">Total</span>
              <span className="font-display text-[#ffd500]">+{Math.round(act.xp)} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}