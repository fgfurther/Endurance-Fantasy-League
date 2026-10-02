import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY = "fl_user_cache";

let cache: any = null;
try {
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  if (raw) cache = JSON.parse(raw);
} catch { /* приватный режим / битые данные — игнорим */ }

const listeners = new Set<(d: any) => void>();
const emit = () => listeners.forEach((l) => l(cache));

export function getCachedUser() { return cache; }
export function subscribeUser(cb: (d: any) => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
export function clearUserCache() {
  cache = null;
  try { localStorage.removeItem(KEY); } catch {}
  emit();
}

let inflight: Promise<any> | null = null;

// Один запрос на всех: дашборд, профиль и прегрев не спамят Render
export function refreshUser(force = false): Promise<any> {
  if (!force && inflight) return inflight;
  inflight = axios
    .get(`${API_URL}/api/user`)
    .then((r) => {
      cache = r.data;
      try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
      emit();
      return cache;
    })
    .catch(() => cache) // сеть легла — держим старый кэш, не роняем UI
    .finally(() => { inflight = null; });
  return inflight;
}

// Будит Render и наполняет кэш, пока юзер ещё на главной
export function warmup() { refreshUser(); }