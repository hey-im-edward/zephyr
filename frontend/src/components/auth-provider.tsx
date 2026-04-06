"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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

const REFRESH_BUFFER_MS = 15_000;
const AUTH_SYNC_CHANNEL = "zephyr-auth";
const AUTH_SYNC_STORAGE_KEY = "zephyr-auth-sync";
const AuthContext = createContext<AuthContextValue | null>(null);

type AuthSyncAction = "session-updated" | "session-cleared";

type AuthSyncMessage = {
  action: AuthSyncAction;
  source: string;
  at: number;
};

function isExpired(isoDate: string) {
  return new Date(isoDate).getTime() <= Date.now() + REFRESH_BUFFER_MS;
}

function parseAuthSyncMessage(value: unknown): AuthSyncMessage | null {
  if (!value) return null;

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed.action === "session-updated" || parsed.action === "session-cleared") &&
      typeof parsed.source === "string"
    ) {
      return {
        action: parsed.action,
        source: parsed.source,
        at: typeof parsed.at === "number" ? parsed.at : Date.now(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function publishAuthSync(message: AuthSyncMessage) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(message);
  window.localStorage.setItem(AUTH_SYNC_STORAGE_KEY, raw);

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
    channel.postMessage(message);
    channel.close();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [isReady, setIsReady] = useState(false);
  const refreshPromiseRef = useRef<Promise<AuthResponse | null> | null>(null);
  const syncSourceRef = useRef(`auth-tab-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextSession = await refreshAuth();
        if (!cancelled) {
          setSession(nextSession);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshPromise = refreshAuth()
      .then((nextSession) => {
        setSession(nextSession);
        return nextSession;
      })
      .catch(() => {
        setSession(null);
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFromExternalChange = async (action: AuthSyncAction) => {
      if (action === "session-cleared") {
        setSession(null);
        return;
      }

      await refreshSession();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_STORAGE_KEY || !event.newValue) {
        return;
      }

      const message = parseAuthSyncMessage(event.newValue);
      if (!message || message.source === syncSourceRef.current) {
        return;
      }

      void syncFromExternalChange(message.action);
    };

    const channel = "BroadcastChannel" in window ? new BroadcastChannel(AUTH_SYNC_CHANNEL) : null;
    const handleChannelMessage = (event: MessageEvent<AuthSyncMessage>) => {
      const message = parseAuthSyncMessage(event.data);
      if (!message || message.source === syncSourceRef.current) {
        return;
      }

      void syncFromExternalChange(message.action);
    };

    window.addEventListener("storage", handleStorage);
    channel?.addEventListener("message", handleChannelMessage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      channel?.removeEventListener("message", handleChannelMessage);
      channel?.close();
    };
  }, [refreshSession]);

  async function ensureAccessToken(currentSession: AuthResponse | null) {
    if (!currentSession) return null;
    if (!isExpired(currentSession.accessTokenExpiresAt)) {
      return currentSession.accessToken;
    }

    const nextSession = await refreshSession();
    return nextSession?.accessToken ?? null;
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
      publishAuthSync({
        action: "session-updated",
        source: syncSourceRef.current,
        at: Date.now(),
      });
      return nextSession;
    },
    registerAction: async (payload) => {
      const nextSession = await register(payload);
      setSession(nextSession);
      publishAuthSync({
        action: "session-updated",
        source: syncSourceRef.current,
        at: Date.now(),
      });
      return nextSession;
    },
    logoutAction: async () => {
      try {
        await logout();
      } catch {
        // Always clear client state even if refresh token is already invalid.
      }

      setSession(null);
      publishAuthSync({
        action: "session-cleared",
        source: syncSourceRef.current,
        at: Date.now(),
      });
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
      publishAuthSync({
        action: "session-updated",
        source: syncSourceRef.current,
        at: Date.now(),
      });
      return user;
    },
    changePasswordAction: async (payload) => {
      const token = await requireAccessToken();
      await changePassword(token, payload);
      try {
        await logout();
      } catch {
        // Mật khẩu đã đổi xong; vẫn cần dọn session client.
      }
      setSession(null);
      publishAuthSync({
        action: "session-cleared",
        source: syncSourceRef.current,
        at: Date.now(),
      });
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
