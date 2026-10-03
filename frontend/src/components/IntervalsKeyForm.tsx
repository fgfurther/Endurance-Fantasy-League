"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { authApi } from "@/lib/auth";
import { refreshUser } from "@/lib/apiCache";

export default function IntervalsKeyForm({
  hasKey,
  athleteId,
}: {
  hasKey: boolean;
  athleteId: string | null;
}) {
  const [apiKey, setApiKey] = useState("");
  const [athleteInput, setAthleteInput] = useState(athleteId || "");
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await authApi.post("/api/intervals/connect", {
        api_key: apiKey,
        athlete_id: athleteInput,
      });
      setMessage({ type: "success", text: `✅ ${res.data.message}` });
      setApiKey("");
      await refreshUser(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Ошибка подключения";
      setMessage({ type: "error", text: `❌ ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Отвязать Intervals.icu? Твои тренировки останутся, но синк перестанет работать.")) return;
    setDisconnecting(true);
    setMessage(null);
    try {
      await authApi.delete("/api/intervals/disconnect");
      setMessage({ type: "success", text: "🔓 Intervals отвязан" });
      await refreshUser(true);
    } catch (err: any) {
      setMessage({ type: "error", text: `❌ ${err.response?.data?.detail || err.message}` });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      {hasKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between gap-3 px-4 py-3 bg-[#5866f2]/15 border-2 border-[#5866f2]"
        >
          <div className="min-w-0">
            <p className="text-[9px] font-bold tracking-widest uppercase text-[#5866f2]">Connected</p>
            <p className="font-bold uppercase truncate">athlete: {athleteId || "—"}</p>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-3 py-2 bg-white border-2 border-black text-[10px] font-bold tracking-widest uppercase hover:bg-[#ff4b26] hover:text-white transition-colors shrink-0 disabled:opacity-50"
          >
            {disconnecting ? "..." : "Disconnect"}
          </button>
        </motion.div>
      )}

      <form onSubmit={handleConnect} className="space-y-3">
        <div>
          <label className="block text-[9px] font-bold tracking-widest uppercase text-[#666] mb-2">
            Intervals.icu API Key
          </label>
          <input
            type="password"
            required
            minLength={5}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? "(leave empty to keep current)" : "1a6qk..."}
            className="w-full px-4 py-3 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:bg-[#ffd500]/20 transition-colors"
          />
          <p className="text-[9px] text-[#666] mt-1 uppercase tracking-wider">
            Intervals.icu → Settings → API → API Key
          </p>
        </div>

        <div>
          <label className="block text-[9px] font-bold tracking-widest uppercase text-[#666] mb-2">
            Athlete ID
          </label>
          <input
            type="text"
            required
            minLength={2}
            value={athleteInput}
            onChange={(e) => setAthleteInput(e.target.value)}
            placeholder="i337004"
            className="w-full px-4 py-3 bg-white border-2 border-black font-mono text-sm focus:outline-none focus:bg-[#ffd500]/20 transition-colors"
          />
          <p className="text-[9px] text-[#666] mt-1 uppercase tracking-wider">
            Usually iXXXXX — check your Intervals profile URL
          </p>
        </div>

        {message && (
          <div
            className={`px-4 py-3 text-sm font-bold ${
              message.type === "success"
                ? "bg-[#ffd500]/30 border-2 border-black"
                : message.type === "error"
                ? "bg-[#ff4b26]/20 border-2 border-[#ff4b26] text-[#ff4b26]"
                : "bg-[#5866f2]/10 border-2 border-[#5866f2] text-[#5866f2]"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 bg-[#ff4b26] text-white text-[11px] font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? "Connecting..." : hasKey ? "Update key →" : "Connect Intervals →"}
        </button>
      </form>
    </div>
  );
}