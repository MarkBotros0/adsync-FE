'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { brandAuthAPI } from '@/lib/api';
import type { Brand, User, UserSession, SubscriptionName, BrandSwitcherEntry } from '@/lib/types';

const STORAGE_KEY = 'brand_session';
const VALIDATE_INTERVAL_MS = 15000;

export interface BrandAuthState {
  user: User | null;
  brand: Brand | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  subscription: SubscriptionName | null;
  /** Populated after login — full list of brands the user can access for the switcher. */
  accessibleBrands: BrandSwitcherEntry[];
  /** True when ORG_ADMIN has no brands created yet — redirect to brand creation. */
  requiresBrandCreation: boolean;
}

export interface UseBrandAuth extends BrandAuthState {
  login: (email: string, password: string) => Promise<UserSession>;
  register: (payload: {
    org_name: string;
    name: string;
    email: string;
    password: string;
    subscription_name?: string;
  }) => Promise<void>;
  switchBrand: (brandId: number) => Promise<void>;
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
  accessibleBrands: [],
  requiresBrandCreation: false,
};

export function useBrandAuth(): UseBrandAuth {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

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
        clearSession();
        setState({ ...EMPTY_STATE });
        tokenRef.current = null;
      } else {
        setState(prev => ({
          ...prev,
          subscription: res.data.subscription,
          isAuthenticated: true,
          isLoading: false,
        }));
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        clearSession();
        setState({ ...EMPTY_STATE });
        tokenRef.current = null;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
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
    if (stored && !isLoginPage) {
      tokenRef.current = stored.token;
      setState({
        user: stored.user,
        brand: stored.user.brand ?? null,
        token: stored.token,
        isLoading: true,
        isAuthenticated: false,
        subscription: (stored.user.brand?.subscription?.name as SubscriptionName) ?? 'free',
        accessibleBrands: [],
        requiresBrandCreation: !stored.user.brand_id,
      });
      runValidation(stored.token).then(() => startPolling(stored.token));
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
    return stopPolling;
  }, [runValidation, startPolling, stopPolling]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<UserSession> => {
    const res = await brandAuthAPI.login({ email, password });
    const data = res.data as unknown as UserSession;

    // Brand selection required — auto-select the first brand
    if (data.requires_brand_selection) {
      const firstBrand = data.brands?.[0];
      if (firstBrand && data.selection_token) {
        const switchRes = await brandAuthAPI.selectBrand({ selection_token: data.selection_token, brand_id: firstBrand.id });
        const switched = switchRes.data as unknown as UserSession;
        const { access_token, user } = switched;
        saveSession(access_token, user);
        tokenRef.current = access_token;
        setState({
          user,
          brand: user.brand ?? null,
          token: access_token,
          isLoading: false,
          isAuthenticated: true,
          subscription: (user.brand?.subscription?.name as SubscriptionName) ?? 'free',
          accessibleBrands: data.brands ?? [],
          requiresBrandCreation: false,
        });
        startPolling(access_token);
        return switched;
      }
      return data;
    }

    const { access_token, user } = data;
    const requiresBrandCreation = !user.brand_id;

    saveSession(access_token, user);
    tokenRef.current = access_token;
    setState({
      user,
      brand: user.brand ?? null,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: (user.brand?.subscription?.name as SubscriptionName) ?? 'free',
      accessibleBrands: [],
      requiresBrandCreation,
    });
    startPolling(access_token);
    return data;
  }, [startPolling]);

  const register = useCallback(async (payload: Parameters<UseBrandAuth['register']>[0]) => {
    const res = await brandAuthAPI.register(payload);
    const { access_token, user } = res.data as unknown as UserSession;
    saveSession(access_token, user);
    tokenRef.current = access_token;
    setState({
      user,
      brand: null,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
      subscription: 'free',
      accessibleBrands: [],
      requiresBrandCreation: true, // new org always starts without brands
    });
    startPolling(access_token);
  }, [startPolling]);

  const switchBrand = useCallback(async (brandId: number) => {
    if (!tokenRef.current) return;
    const res = await brandAuthAPI.switchBrand(tokenRef.current, brandId);
    const { access_token, user } = res.data as unknown as UserSession;
    saveSession(access_token, user);
    tokenRef.current = access_token;
    setState(prev => ({
      ...prev,
      user,
      brand: user.brand ?? null,
      token: access_token,
      subscription: (user.brand?.subscription?.name as SubscriptionName) ?? 'free',
      requiresBrandCreation: false,
    }));
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
    const stored = loadStoredSession();
    if (stored) saveSession(access_token, stored.user);
    tokenRef.current = access_token;
    setState(prev => ({ ...prev, token: access_token }));
    startPolling(access_token);
  }, [startPolling]);

  return { ...state, login, register, switchBrand, logout, forceSignOut };
}
