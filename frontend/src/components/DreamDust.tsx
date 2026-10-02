"use client";

import { useState, useEffect } from "react";

/* ── Искры (звёздная пыль) ── */
const COLORS = ["#ffd500", "#f6b8d0", "#5866f2", "#ff4b26", "#ffffff"];
const TYPES = ["dot", "spark", "plus"] as const;
type PType = (typeof TYPES)[number];

interface Particle {
  id: number;
  type: PType;
  top: number;
  left: number;
  size: number;
  color: string;
  twinkle: number;
  drift: number;
  delay: number;
  baseOpacity: number;
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    return {
      id: i,
      type,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: type === "spark" ? 4 + Math.random() * 5 : 2 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinkle: 2.5 + Math.random() * 4,
      drift: 9 + Math.random() * 11,
      delay: Math.random() * 6,
      baseOpacity: 0.1 + Math.random() * 0.25,
    };
  });
}

function Glyph({ p }: { p: Particle }) {
  if (p.type === "spark") {
    return (
      <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill={p.color}>
        <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12 8-1 11-4 12-12z" />
      </svg>
    );
  }
  if (p.type === "plus") {
    return (
      <svg viewBox="0 0 24 24" width={p.size} height={p.size} stroke={p.color} strokeWidth="4" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    );
  }
  return <div style={{ width: p.size, height: p.size, background: p.color, borderRadius: 9999 }} />;
}

/* ── Сгустки сна (мягкий туман) ── */
const SOFT = ["#f6b8d0", "#5866f2", "#a5b4fc", "#ffd500", "#ff4b26", "#ffffff"];

interface Mist {
  id: number;
  top: number;
  left: number;
  size: number;
  color: string;
  blur: number;
  maxOpacity: number;
  fade: number;
  drift: number;
  morph: number;
  phase: number;
}

function makeMist(count: number): Mist[] {
  return Array.from({ length: count }, (_, i) => {
    const fade = 16 + Math.random() * 14;
    const drift = 30 + Math.random() * 25;
    const morph = 14 + Math.random() * 10;
    return {
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 70 + Math.random() * 100,
      color: SOFT[Math.floor(Math.random() * SOFT.length)],
      blur: 10 + Math.random() * 12,
      maxOpacity: 0.05 + Math.random() * 0.08,
      fade,
      drift,
      morph,
      phase: -(Math.random() * fade),
    };
  });
}

export default function DreamDust() {
  // Состояние только для клиента — сервер рендерит пусто
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mist, setMist] = useState<Mist[]>([]);

  useEffect(() => {
    // Генерация происходит ТОЛЬКО на клиенте после гидрации
    setParticles(makeParticles(36));
    setMist(makeMist(8));
  }, []);

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden" aria-hidden>
      {/* Слой 1: мягкий туман */}
      {mist.map((m) => (
        <div
          key={`m-${m.id}`}
          className="absolute"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            background: m.color,
            filter: `blur(${m.blur}px)`,
            borderRadius: "50% 40% 60% 45%",
            ["--bo" as any]: m.maxOpacity,
            animation: [
              `blobFade ${m.fade}s ease-in-out ${m.phase}s infinite`,
              `blobMorph ${m.morph}s ease-in-out ${m.phase}s infinite`,
              `blobDrift ${m.drift}s ease-in-out ${m.phase}s infinite`,
            ].join(", "),
          }}
        />
      ))}

      {/* Слой 2: звёздная пыль */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            animation: `dustDrift ${p.drift}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <div
            style={{
              ["--o" as any]: p.baseOpacity,
              opacity: p.baseOpacity,
              animation: `dustTwinkle ${p.twinkle}s ease-in-out ${p.delay}s infinite`,
              display: "flex",
            }}
          >
            <Glyph p={p} />
          </div>
        </div>
      ))}
    </div>
  );
}