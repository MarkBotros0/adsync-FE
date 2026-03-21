'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { brandAuthAPI } from '@/lib/api';
import type { Brand, BrandSession, SubscriptionName } from '@/lib/types';

const STORAGE_KEY = 'brand_session';
const VALIDATE_INTERVAL_MS = 5000; // 5 seconds

export interface BrandAuthState {
  brand: Brand | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscription: SubscriptionName | null;
}

export interface UseBrandAuth extends BrandAuthState {
  login: (email: string, password: string) => Promise<void>;
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

function loadStoredSession(): { token: string; brand: Brand } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(token: string, brand: Brand) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, brand }));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function useBrandAuth(): UseBrandAuth {
  const [state, setState] = useState<BrandAuthState>({
    brand: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    subscription: null,
  });

  const tokenRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Validation tick ──────────────────────────────────────────────────────

  const runValidation = useCallback(async (token: string) => {
    try {
      const res = await brandAuthAPI.validate(token);
      if (!res.data.valid) {
        // Server says session is no longer valid (e.g. force-signout by another device)
        clearSession();
        setState({ brand: null, token: null, isLoading: false, isAuthenticated: false, subscription: null });
        tokenRef.current = null;
      } else {
        setState(prev => ({
          ...prev,
          subscription: res.data.subscription,
          isAuthenticated: true,
        }));
      }
    } catch {
      // On network error or 401, sign out
      clearSession();
      setState({ brand: null, token: null, isLoading: false, isAuthenticated: false, subscription: null });
      tokenRef.current = null;
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
        brand: stored.brand,
        token: stored.token,
        isLoading: false,
        isAuthenticated: true,
        subscription: (stored.brand.subscription?.name as SubscriptionName) ?? 'free',
      });
      // Immediately validate, then start polling
      runValidation(stored.token).then(() => startPolling(stored.token));
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }

    return stopPolling;
  }, [runValidation, startPolling, stopPolling]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const res = await brandAuthAPI.login({ email, password });
    const { access_token, brand } = res.data as unknown as BrandSession;
    saveSession(access_token, brand);
    tokenRef.current = access_token;
    setState({
      brand,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: (brand.subscription?.name as SubscriptionName) ?? 'free',
    });
    startPolling(access_token);
  }, [startPolling]);

  const register = useCallback(async (payload: Parameters<typeof brandAuthAPI.register>[0]) => {
    const res = await brandAuthAPI.register(payload);
    const { access_token, brand } = res.data as unknown as BrandSession;
    saveSession(access_token, brand);
    tokenRef.current = access_token;
    setState({
      brand,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: (brand.subscription?.name as SubscriptionName) ?? 'free',
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
    setState({ brand: null, token: null, isLoading: false, isAuthenticated: false, subscription: null });
  }, [stopPolling]);

  const forceSignOut = useCallback(async () => {
    if (!tokenRef.current) return;
    const res = await brandAuthAPI.forceSignOut(tokenRef.current);
    // Server rotated the key and returned a new token for the current session
    const { access_token, brand } = res.data as unknown as BrandSession;
    saveSession(access_token, brand);
    tokenRef.current = access_token;
    setState(prev => ({ ...prev, token: access_token, brand }));
    // Restart polling with the new token
    startPolling(access_token);
  }, [startPolling]);

  return { ...state, login, register, logout, forceSignOut };
}
