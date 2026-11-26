export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("noces-token");
}

export function setToken(token: string) {
  localStorage.setItem("noces-token", token);
}

export function clearToken() {
  localStorage.removeItem("noces-token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isForm) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...options, headers });
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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}${path}`);
    const token = getToken();
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
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve(data);
        return;
      }
      reject(new Error(data.error || "La requête a échoué"));
    };
    xhr.send(body);
  });
}
