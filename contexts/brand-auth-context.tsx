'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useBrandAuth, type UseBrandAuth } from '@/hooks/use-brand-auth';

const BrandAuthContext = createContext<UseBrandAuth | null>(null);

export function BrandAuthProvider({ children }: { children: ReactNode }) {
  const auth = useBrandAuth();
  return (
    <BrandAuthContext.Provider value={auth}>
      {children}
    </BrandAuthContext.Provider>
  );
}

/**
 * Access the brand auth state and actions anywhere in the tree.
 *
 * Must be used inside a <BrandAuthProvider>.
 */
export function useBrandAuthContext(): UseBrandAuth {
  const ctx = useContext(BrandAuthContext);
  if (!ctx) throw new Error('useBrandAuthContext must be used inside <BrandAuthProvider>');
  return ctx;
}
