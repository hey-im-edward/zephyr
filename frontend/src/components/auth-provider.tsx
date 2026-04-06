"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  changePassword,
  getCurrentUser,
  login,
  logout,
  refreshAuth,
  register,
  updateProfile,
} from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
} from "@/lib/types";

type AuthContextValue = {
  isReady: boolean;
  session: AuthResponse | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  getAccessToken: () => Promise<string | null>;
  loginAction: (payload: LoginPayload) => Promise<AuthResponse>;
  registerAction: (payload: RegisterPayload) => Promise<AuthResponse>;
  logoutAction: () => Promise<void>;
  reloadUser: () => Promise<AuthUser | null>;
  updateProfileAction: (payload: ProfileUpdatePayload) => Promise<AuthUser>;
  changePasswordAction: (payload: ChangePasswordPayload) => Promise<void>;
};

const STORAGE_KEY = "zephyr-auth";
const REFRESH_BUFFER_MS = 15_000;
const AuthContext = createContext<AuthContextValue | null>(null);

function isExpired(isoDate: string) {
  return new Date(isoDate).getTime() <= Date.now() + REFRESH_BUFFER_MS;
}

function readStoredSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistSession(session: AuthResponse | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setSession(readStoredSession());
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    persistSession(session);
  }, [isReady, session]);

  async function refreshSession(current: AuthResponse) {
    const nextSession = await refreshAuth(current.refreshToken);
    setSession(nextSession);
    return nextSession;
  }

  async function ensureAccessToken(currentSession: AuthResponse | null) {
    if (!currentSession) return null;
    if (!isExpired(currentSession.accessTokenExpiresAt)) {
      return currentSession.accessToken;
    }

    try {
      const nextSession = await refreshSession(currentSession);
      return nextSession.accessToken;
    } catch {
      setSession(null);
      return null;
    }
  }

  async function requireAccessToken() {
    const token = await ensureAccessToken(session);
    if (!token) {
      throw new Error("Bạn cần đăng nhập lại.");
    }
    return token;
  }

  const value: AuthContextValue = {
    isReady,
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.accessToken),
    isAdmin: session?.user.role === "ADMIN",
    getAccessToken: () => ensureAccessToken(session),
    loginAction: async (payload) => {
      const nextSession = await login(payload);
      setSession(nextSession);
      return nextSession;
    },
    registerAction: async (payload) => {
      const nextSession = await register(payload);
      setSession(nextSession);
      return nextSession;
    },
    logoutAction: async () => {
      if (session?.refreshToken) {
        try {
          await logout(session.refreshToken);
        } catch {
          // Always clear client state even if refresh token is already invalid.
        }
      }

      setSession(null);
    },
    reloadUser: async () => {
      const token = await ensureAccessToken(session);
      if (!token) return null;

      const current = await getCurrentUser(token);
      setSession((existing) => (existing ? { ...existing, user: current.user } : existing));
      return current.user;
    },
    updateProfileAction: async (payload) => {
      const token = await requireAccessToken();
      const user = await updateProfile(token, payload);
      setSession((existing) => (existing ? { ...existing, user } : existing));
      return user;
    },
    changePasswordAction: async (payload) => {
      const token = await requireAccessToken();
      await changePassword(token, payload);
      setSession(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
