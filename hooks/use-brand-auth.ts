'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { brandAuthAPI } from '@/lib/api';
import type { Brand, User, UserSession, SubscriptionName } from '@/lib/types';

const STORAGE_KEY = 'brand_session';
const VALIDATE_INTERVAL_MS = 5000; // 5 seconds

export interface BrandAuthState {
  user: User | null;
  /** Convenience shortcut — same as user.brand. Kept for backwards compatibility. */
  brand: Brand | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscription: SubscriptionName | null;
}

export interface UseBrandAuth extends BrandAuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    subscription_name?: string;
    logo_url?: string;
    website?: string;
    industry?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forceSignOut: () => Promise<void>;
}

function loadStoredSession(): { token: string; user: User } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(token: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

const EMPTY_STATE: BrandAuthState = {
  user: null,
  brand: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  subscription: null,
};

export function useBrandAuth(): UseBrandAuth {
  const [state, setState] = useState<BrandAuthState>({
    ...EMPTY_STATE,
    isLoading: true,
  });

  const tokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Validation tick ──────────────────────────────────────────────────────

  const runValidation = useCallback(async (token: string) => {
    try {
      const res = await brandAuthAPI.validate(token);
      if (!res.data.valid) {
        // Server explicitly says session is no longer valid (e.g. force-signout by another device)
        clearSession();
        setState({ ...EMPTY_STATE });
        tokenRef.current = null;
      } else {
        setState(prev => ({
          ...prev,
          subscription: res.data.subscription,
          isAuthenticated: true,
        }));
      }
    } catch (err: unknown) {
      // Only sign out on explicit server rejection (401). Network errors / backend down
      // should not end the session — the user will retry on the next poll.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        clearSession();
        setState({ ...EMPTY_STATE });
        tokenRef.current = null;
      }
    }
  }, []);

  const startPolling = useCallback((token: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (tokenRef.current) runValidation(tokenRef.current);
    }, VALIDATE_INTERVAL_MS);
  }, [runValidation]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Bootstrap from localStorage ──────────────────────────────────────────

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      tokenRef.current = stored.token;
      setState({
        user: stored.user,
        brand: stored.user.brand ?? null,
        token: stored.token,
        isLoading: false,
        isAuthenticated: true,
        subscription: (stored.user.brand?.subscription?.name as SubscriptionName) ?? 'free',
      });
      // Immediately validate, then start polling
      runValidation(stored.token).then(() => startPolling(stored.token));
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return stopPolling;
  }, [runValidation, startPolling, stopPolling]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await brandAuthAPI.login({ email, password });
    const { access_token, user } = res.data as unknown as UserSession;
    saveSession(access_token, user);
    tokenRef.current = access_token;
    setState({
      user,
      brand: user.brand ?? null,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: (user.brand?.subscription?.name as SubscriptionName) ?? 'free',
    });
    startPolling(access_token);
    return user;
  }, [startPolling]);

  const register = useCallback(async (payload: Parameters<typeof brandAuthAPI.register>[0]) => {
    const res = await brandAuthAPI.register(payload);
    const { access_token, user } = res.data as unknown as UserSession;
    saveSession(access_token, user);
    tokenRef.current = access_token;
    setState({
      user,
      brand: user.brand ?? null,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: (user.brand?.subscription?.name as SubscriptionName) ?? 'free',
    });
    startPolling(access_token);
  }, [startPolling]);

  const logout = useCallback(async () => {
    if (tokenRef.current) {
      try { await brandAuthAPI.logout(tokenRef.current); } catch { /* ignore */ }
    }
    stopPolling();
    clearSession();
    tokenRef.current = null;
    setState({ ...EMPTY_STATE });
  }, [stopPolling]);

  const forceSignOut = useCallback(async () => {
    if (!tokenRef.current) return;
    const res = await brandAuthAPI.forceSignOut(tokenRef.current);
    const { access_token } = res.data;

    // Update stored session with the new token (user/brand are unchanged)
    const stored = loadStoredSession();
    if (stored) {
      saveSession(access_token, stored.user);
    }
    tokenRef.current = access_token;
    setState(prev => ({ ...prev, token: access_token }));
    // Restart polling with the new token
    startPolling(access_token);
  }, [startPolling]);

  return { ...state, login, register, logout, forceSignOut };
}
