import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/lib/types";
import { apiFetch, clearTokens, getAccessToken, setTokens } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (identity: string, password: string) => Promise<void>; // email OR username
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type TokenResponse = {
  access: string;
  refresh?: string;
  user?: any;
};

function mapApiUser(u: any): User {
  const createdAtRaw = u?.created_at || u?.date_joined || u?.createdAt || null;

  return {
    id: String(u?.id ?? u?.pk ?? "unknown"),
    username: String(u?.username ?? u?.name ?? "User"),
    email: String(u?.email ?? ""),
    avatar: u?.avatar || u?.profile_image || "",
    role: (u?.role as any) || "creator",
    createdAt: createdAtRaw ? new Date(createdAtRaw) : new Date(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const isAuthenticated = useMemo(() => !!user || !!getAccessToken(), [user]);

  async function hydrateUser() {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsBootstrapping(false);
      return;
    }

    try {
      const me = await apiFetch<any>("/auth/me/", { method: "GET" });
      setUser(mapApiUser(me));
    } catch {
      // fallback: token exists, so treat as signed in
      setUser((prev) =>
        prev || {
          id: "me",
          username: "Creator",
          email: "",
          avatar: "",
          role: "creator",
          createdAt: new Date(),
        }
      );
    } finally {
      setIsBootstrapping(false);
    }
  }

  useEffect(() => {
    hydrateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIXED: identity can be username OR email; we send BOTH keys for compatibility
  const login = async (identity: string, password: string) => {
    const id = identity.trim();

    const data = await apiFetch<TokenResponse>("/auth/login/", {
      method: "POST",
      json: {
        username: id,
        email: id,
        password,
      },
    });

    setTokens({ access: data.access, refresh: data.refresh });

    if (data.user) {
      setUser(mapApiUser(data.user));
    } else {
      await hydrateUser();
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    const data = await apiFetch<TokenResponse>("/auth/register/", {
      method: "POST",
      json: { username: username.trim(), email: email.trim(), password },
    });

    setTokens({ access: data.access, refresh: data.refresh });

    if (data.user) {
      setUser(mapApiUser(data.user));
    } else {
      await hydrateUser();
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isBootstrapping,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
