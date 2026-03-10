"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  isSubscribed: boolean;
  subscriptionTier?: "free" | "premium";
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
};

const API_BASE_URL = "/api/auth";
const STORAGE_KEY = "asf_user";
const TOKEN_KEY = "token";

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const pair = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return pair ? decodeURIComponent(pair.split("=")[1] ?? "") : null;
}

function hasValidToken() {
  if (typeof window === "undefined") {
    return false;
  }

  const rawToken = readCookie(TOKEN_KEY);
  if (!rawToken) return false;
  const payload = decodeJwtPayload(rawToken);
  if (!payload) return false;
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
}

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return readCookie(TOKEN_KEY);
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded) as Partial<AuthUser> & { sub?: string; exp?: number };
  } catch {
    return null;
  }
}

function parseStoredUser(raw: string | null): AuthUser | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.id || !parsed.email || !parsed.name) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      isSubscribed: Boolean(parsed.isSubscribed),
      subscriptionTier: parsed.subscriptionTier === "premium" ? "premium" : "free",
    };
  } catch {
    return null;
  }
}

function parseUserFromToken(rawToken: string | null): AuthUser | null {
  if (!rawToken) return null;
  const payload = decodeJwtPayload(rawToken);
  if (!payload?.id || !payload?.email) {
    return null;
  }
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : "User",
    isSubscribed: Boolean(payload.isSubscribed),
    subscriptionTier: payload.subscriptionTier === "premium" ? "premium" : "free",
  };
}

function getInitialUser() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!hasValidToken()) {
    return null;
  }

  const fromStorage = parseStoredUser(localStorage.getItem(STORAGE_KEY));
  if (fromStorage) return fromStorage;

  return parseUserFromToken(readStoredToken());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return hasValidToken();
  });

  const login = async (payload: LoginPayload) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = (await parseJsonSafely<
      | {
          user: {
            id: number | string;
            name: string;
            email: string;
            isSubscribed?: boolean;
            subscriptionTier?: "free" | "premium";
          };
          token?: string;
        }
      | { error?: string }
    >(response)) ?? { error: "Пустой или некорректный ответ сервера." };

    if (!response.ok || !("user" in data)) {
      throw new Error(("error" in data && data.error) || "Не удалось войти.");
    }

    const normalized: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      isSubscribed: Boolean(data.user.isSubscribed),
      subscriptionTier: data.user.subscriptionTier === "premium" ? "premium" : "free",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    setUser(normalized);
    setIsAuthenticated(true);
    return normalized;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = (await parseJsonSafely<{ error?: string }>(response)) ?? {
      error: "Пустой или некорректный ответ сервера.",
    };

    if (!response.ok) {
      throw new Error(data.error || "Не удалось зарегистрироваться.");
    }
  };

  const refreshProfile = useCallback(async () => {
    const response = await fetch("/api/users/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }

      throw new Error("Не удалось обновить профиль.");
    }

    const data = (await response.json()) as {
      id: number | string;
      name: string;
      email: string;
      isSubscribed?: boolean;
      subscriptionTier?: "free" | "premium";
    };

    const normalized: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      isSubscribed: Boolean(data.isSubscribed),
      subscriptionTier: data.subscriptionTier === "premium" ? "premium" : "free",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    setUser(normalized);
    setIsAuthenticated(true);
    return normalized;
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // local logout is still applied
    }

    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  useEffect(() => {
    const syncSession = () => {
      const valid = hasValidToken();
      setIsAuthenticated(valid);
      if (!valid) {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          document.cookie = "token=; Max-Age=0; path=/";
        }
      } else if (!user) {
        const tokenUser = parseUserFromToken(readStoredToken());
        if (tokenUser) {
          setUser(tokenUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenUser));
        }
      }
    };

    syncSession();
    const intervalId = window.setInterval(syncSession, 15000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, isSubscribed: Boolean(user?.isSubscribed), login, register, logout, refreshProfile }),
    [isAuthenticated, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
