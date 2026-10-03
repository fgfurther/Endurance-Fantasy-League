import { authApi, isAuthenticated, clearAuth } from "@/lib/auth";

const KEY = "fl_user_cache";

let cache: any = null;
try {
  const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
  if (raw) cache = JSON.parse(raw);
} catch {}

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

export function refreshUser(force = false): Promise<any> {
  if (!isAuthenticated()) {
    // нет токена — не запрашиваем API
    cache = null;
    emit();
    return Promise.resolve(null);
  }
  if (!force && inflight) return inflight;
  
  inflight = authApi
    .get(`/api/user`)
    .then((r) => {
      cache = r.data;
      try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
      emit();
      return cache;
    })
    .catch((err) => {
      // если 401 — interceptor уже редиректит, просто возвращаем null
      if (err.response?.status === 401) {
        clearAuth();
        cache = null;
        emit();
        return null;
      }
      return cache;
    })
    .finally(() => { inflight = null; });
  
  return inflight;
}

export function warmup() { refreshUser(); }