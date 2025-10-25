const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
export function getToken(): string | null { return localStorage.getItem("token"); }
export function setToken(t: string) { localStorage.setItem("token", t); }
export function clearToken() { localStorage.removeItem("token"); }
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
