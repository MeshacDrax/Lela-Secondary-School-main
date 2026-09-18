import type { AuthUser } from "@lela/shared";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export async function apiRequest<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }

  const envelope = await response.json();
  return envelope.data as T;
}

export async function login(email: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function downloadReport(moduleKey: string, token: string, format: "pdf" | "excel", query = "") {
  await downloadApiFile(`/api/reports/${moduleKey}?format=${format}&q=${encodeURIComponent(query)}`, token, `${moduleKey}-report.${format === "pdf" ? "pdf" : "csv"}`);
}

export async function downloadApiFile(path: string, token: string, fallbackFilename: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("File download failed");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filename = disposition.match(/filename="?(?<filename>[^"]+)"?/)?.groups?.filename ?? fallbackFilename;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function realtimeUrl(token: string) {
  return `${API_BASE}/api/realtime?token=${encodeURIComponent(token)}`;
}
