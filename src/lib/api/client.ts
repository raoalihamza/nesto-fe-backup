import { store } from "@/store";
import { setCredentials, logout } from "@/store/slices/authSlice";
import type { ApiError, AuthSuccessResponse } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

let isRefreshing = false;
let refreshPromise: Promise<AuthSuccessResponse> | null = null;

function handleAuthFailure(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nesto_access_token");
    localStorage.removeItem("nesto_refresh_token");
  }
  store.dispatch(logout());
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...init } = options ?? {};

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (init.body) {
    headers["Content-Type"] ??= "application/json";
  }

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("nesto_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    if (typeof window === "undefined") {
      const body = await response.json().catch(() => ({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
        requestId: "",
        timestamp: "",
        path,
      }));
      throw body as ApiError;
    }

    const refreshToken = localStorage.getItem("nesto_refresh_token");
    if (!refreshToken) {
      handleAuthFailure();
      throw {
        code: "UNAUTHORIZED",
        message: "Session expired",
        requestId: "",
        timestamp: "",
        path,
      } as ApiError;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Refresh failed");
          return (await res.json()) as AuthSuccessResponse;
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      const refreshData = await refreshPromise!;
      localStorage.setItem(
        "nesto_access_token",
        refreshData.tokens.accessToken
      );
      localStorage.setItem(
        "nesto_refresh_token",
        refreshData.tokens.refreshToken
      );

      const currentUser = store.getState().auth.user;
      if (currentUser) {
        store.dispatch(
          setCredentials({
            user: currentUser,
            accessToken: refreshData.tokens.accessToken,
            refreshToken: refreshData.tokens.refreshToken,
          })
        );
      }

      headers["Authorization"] = `Bearer ${refreshData.tokens.accessToken}`;
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      });

      if (!retryResponse.ok) {
        const body = await retryResponse.json().catch(() => ({
          code: "UNKNOWN",
          message: "Request failed after token refresh",
          requestId: "",
          timestamp: "",
          path,
        }));
        throw body as ApiError;
      }

      return (await retryResponse.json()) as T;
    } catch {
      handleAuthFailure();
      throw {
        code: "UNAUTHORIZED",
        message: "Session expired",
        requestId: "",
        timestamp: "",
        path,
      } as ApiError;
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      code: "UNKNOWN",
      message: `HTTP ${response.status}`,
      requestId: "",
      timestamp: "",
      path,
    }));
    throw body as ApiError;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}
