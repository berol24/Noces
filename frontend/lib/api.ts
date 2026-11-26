export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ACCESS_KEY = "noces-token";
const REFRESH_KEY = "noces-refresh";

export type SessionTokens = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function setSession(body: SessionTokens) {
  const access = body.accessToken || body.token;
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (body.refreshToken) localStorage.setItem(REFRESH_KEY, body.refreshToken);
}

export function clearToken() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function expiresSoon(token: string) {
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const payload = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const response = await fetch(`${API}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const data = (await response.json().catch(() => ({}))) as SessionTokens;
        if (!response.ok || !(data.accessToken || data.token)) {
          clearToken();
          return null;
        }
        setSession(data);
        return data.accessToken || data.token || null;
      } catch {
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function ensureAccess() {
  const current = getToken();
  if (current && !expiresSoon(current)) return current;
  return (await refreshAccess()) || current;
}

export async function logoutSession() {
  const refreshToken = getRefreshToken();
  clearToken();
  if (!refreshToken) return;
  await fetch(`${API}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}

function skipRefresh(path: string) {
  return ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/forgot", "/api/auth/reset", "/api/auth/password"].some((item) =>
    path.startsWith(item),
  );
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isForm) headers.set("Content-Type", "application/json");
  const token = skipRefresh(path) ? getToken() : await ensureAccess();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...options, headers });
  if (response.status === 401 && !retried && !skipRefresh(path)) {
    const next = await refreshAccess();
    if (next) return api<T>(path, options, true);
  }
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "La requête a échoué");
  return data as T;
}

export function driveFileUrl(id: string) {
  return `${API}/api/drive/files/${id}`;
}

export function uploadFiles<T>(path: string, files: File[], onProgress?: (ratio: number) => void): Promise<T> {
  const body = new FormData();
  for (const file of files) body.append("photos", file);
  if (!onProgress) return api<T>(path, { method: "POST", body });

  const send = (token: string | null, retried = false): Promise<T> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API}${path}`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onloadstart = () => onProgress(0.08);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !event.total) return;
        onProgress(Math.min(0.85, event.loaded / event.total));
      };
      xhr.onerror = () => reject(new Error("Envoi impossible"));
      xhr.onload = () => {
        let data = {} as T & { error?: string };
        try {
          data = JSON.parse(xhr.responseText || "{}") as T & { error?: string };
        } catch {
          data = {} as T & { error?: string };
        }
        if (xhr.status === 401 && !retried) {
          refreshAccess()
            .then((next) => (next ? send(next, true).then(resolve, reject) : reject(new Error(data.error || "Session expirée"))))
            .catch(() => reject(new Error(data.error || "Session expirée")));
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(1);
          resolve(data);
          return;
        }
        reject(new Error(data.error || "La requête a échoué"));
      };
      xhr.send(body);
    });

  return ensureAccess().then((token) => send(token));
}
