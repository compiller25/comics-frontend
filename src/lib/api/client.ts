// src/lib/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE || "http://127.0.0.1:8000";

export function absolutizeMedia(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_BASE}${url}`;
}

/** Support multiple token key names (prevents “logged in but 401”) */
export function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token") ||
    null
  );
}

export function getRefreshToken() {
  return (
    localStorage.getItem("refresh_token") ||
    localStorage.getItem("refresh") ||
    null
  );
}

export function setTokens(tokens: { access?: string; refresh?: string }) {
  if (tokens.access) {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("access", tokens.access); // keep compatibility
  }
  if (tokens.refresh) {
    localStorage.setItem("refresh_token", tokens.refresh);
    localStorage.setItem("refresh", tokens.refresh); // keep compatibility
  }
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("token");
}

/**
 * Reads response safely.
 * - If JSON: returns parsed JSON
 * - If not JSON (HTML/text): returns { _raw: string }
 */
async function safeRead(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  return { _raw: text };
}

function looksAuthRelated401(data: any) {
  const detail = typeof data?.detail === "string" ? data.detail.toLowerCase() : "";
  return (
    data?.code === "token_not_valid" ||
    detail.includes("token not valid") ||
    detail.includes("token is invalid") ||
    detail.includes("not valid for any token type") ||
    detail.includes("authentication credentials were not provided") ||
    detail.includes("credentials were not provided")
  );
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const candidates = ["/auth/refresh/", "/auth/token/refresh/"];

    for (const path of candidates) {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include", // supports cookie-based auth too
          body: JSON.stringify({ refresh }),
        });

        const data = await safeRead(res);

        if (res.ok) {
          const access = data?.access || data?.access_token;
          const newRefresh = data?.refresh || data?.refresh_token;

          if (access) {
            setTokens({ access, refresh: newRefresh || refresh });
            return true;
          }
        }
      } catch {
        // try next candidate
      }
    }

    return false;
  })();

  const ok = await refreshPromise;
  refreshPromise = null;
  return ok;
}

/**
 * apiFetch: JWT + refresh + cookie-friendly (PythonAnywhere safe)
 */
export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const buildHeaders = () => {
    const h = new Headers(opts.headers || {});
    h.set("Accept", "application/json");

    // JSON payload
    if (opts.json !== undefined) {
      h.set("Content-Type", "application/json");
    }

    const token = getAccessToken();
    if (token) h.set("Authorization", `Bearer ${token}`);

    return h;
  };

  const buildBody = () => {
    if (opts.json !== undefined) return JSON.stringify(opts.json);
    return opts.body;
  };

  const doRequest = async () => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: buildHeaders(),
      body: buildBody(),
      credentials: "include", // IMPORTANT (cookie/session fallback + some hosts)
    });
    const data = await safeRead(res);
    return { res, data };
  };

  // 1) first attempt
  let { res, data } = await doRequest();

  // 2) 401 → try refresh once (covers both token_not_valid AND “credentials not provided”)
  if (res.status === 401 && looksAuthRelated401(data)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      ({ res, data } = await doRequest());
    } else {
      clearTokens();
    }
  }

  if (!res.ok) {
    let msg =
      data?.detail ||
      data?.message ||
      (data && typeof data === "object"
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
            .join(" | ")
        : null) ||
      `Request failed: ${res.status}`;

    throw new Error(msg);
  }

  return data as T;
}