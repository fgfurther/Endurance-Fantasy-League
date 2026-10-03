import axios from "axios";

const TOKEN_KEY = "fl_token";
const USER_KEY = "fl_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string, user?: any) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("fl_user_cache"); // сбросить apiCache
  } catch {}
}

export function getCachedAuthUser(): any | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Защищённый axios-клиент — автоматически подставляет Bearer-токен. */
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

authApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authApi.interceptors.response.use(
  (res) => res,
  (err) => {
    // Если токен протух — разлогиниваем и редиректим
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        clearAuth();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);